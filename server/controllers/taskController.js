const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @desc    Get all tasks for current user (created by them + assigned to them)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [{ creator: userId }, { assignee: userId }],
    })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
    });
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private (only creator or assignee)
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('assignee', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const userId = req.user._id.toString();
    const isCreator = task.creator._id.toString() === userId;
    const isAssignee = task.assignee && task.assignee._id.toString() === userId;

    // Only creator or assignee can view
    if (!isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden — you do not have access to this task',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
    });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignee } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // If assignee is provided, verify they exist
    if (assignee) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(400).json({
          success: false,
          message: 'Assignee user not found',
        });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      dueDate: dueDate || null,
      creator: req.user._id,
      assignee: assignee || null,
    });

    // Populate before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email')
      .populate('assignee', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('task_created', populatedTask);
      if (assignee) {
        io.to(assignee.toString()).emit('task_created', populatedTask);
      }
    }

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating task',
    });
  }
};

/**
 * @desc    Update a task (with role-based field restrictions)
 * @route   PUT /api/tasks/:id
 * @access  Private (creator or assignee, with field restrictions)
 *
 * PERMISSION LOGIC:
 * ┌──────────────────┬──────────────────────────────────────────┐
 * │ Personal Task    │ Creator can update ALL fields            │
 * │ (no assignee)    │                                          │
 * ├──────────────────┼──────────────────────────────────────────┤
 * │ Assigned Task    │ Creator (Assigner): can update dueDate   │
 * │ (has assignee)   │ Assignee: can update status ONLY         │
 * └──────────────────┴──────────────────────────────────────────┘
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const userId = req.user._id.toString();
    const isCreator = task.creator.toString() === userId;
    const isAssignee = task.assignee && task.assignee.toString() === userId;

    // User must be either creator or assignee
    if (!isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden — you do not have access to this task',
      });
    }

    const isPersonalTask = !task.assignee; // No assignee = personal task
    const updateData = {};

    if (isPersonalTask && isCreator) {
      // ─── Personal Task: Creator can update ALL fields ───
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.dueDate !== undefined) updateData.dueDate = req.body.dueDate;

      // Allow assigning to someone (converting personal → assigned)
      if (req.body.assignee !== undefined) {
        if (req.body.assignee) {
          const assigneeUser = await User.findById(req.body.assignee);
          if (!assigneeUser) {
            return res.status(400).json({
              success: false,
              message: 'Assignee user not found',
            });
          }
        }
        updateData.assignee = req.body.assignee || null;
      }
    } else if (!isPersonalTask && isCreator) {
      // ─── Assigned Task + User is Assigner: can ONLY update dueDate ───
      if (req.body.dueDate !== undefined) {
        updateData.dueDate = req.body.dueDate;
      }

      // Check if they tried to update restricted fields
      const restrictedFields = ['title', 'description', 'status'];
      const attemptedRestricted = restrictedFields.filter(
        (f) => req.body[f] !== undefined
      );

      if (attemptedRestricted.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Forbidden — as the assigner, you cannot modify: ${attemptedRestricted.join(', ')}. You can only update the due date.`,
        });
      }
    } else if (!isPersonalTask && isAssignee) {
      // ─── Assigned Task + User is Assignee: can ONLY update status ───
      if (req.body.status !== undefined) {
        updateData.status = req.body.status;
      }

      // Check if they tried to update restricted fields
      const restrictedFields = ['title', 'description', 'dueDate'];
      const attemptedRestricted = restrictedFields.filter(
        (f) => req.body[f] !== undefined
      );

      if (attemptedRestricted.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Forbidden — as the assignee, you cannot modify: ${attemptedRestricted.join(', ')}. You can only update the status.`,
        });
      }
    }

    // Apply the update
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('creator', 'name email')
      .populate('assignee', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io && updatedTask) {
      // Always emit to creator
      io.to(updatedTask.creator._id.toString()).emit('task_updated', updatedTask);
      
      // If there is an assignee (either previously or newly added via this update), emit to them.
      // E.g. If user assigned someone, the assignee gets it. 
      // If task was reassigned, the old assignee technically misses the update to 'remove' it unless we tracked old state. 
      // For this spec, emitting to current creator and assignee is enough.
      if (updatedTask.assignee) {
        io.to(updatedTask.assignee._id.toString()).emit('task_updated', updatedTask);
      }
    }

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating task',
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private (creator only)
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const userId = req.user._id.toString();
    const isCreator = task.creator.toString() === userId;

    // Only the creator can delete
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden — only the task creator can delete this task',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(task.creator.toString()).emit('task_deleted', task._id);
      if (task.assignee) {
        io.to(task.assignee.toString()).emit('task_deleted', task._id);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
    });
  }
};

/**
 * @desc    Search users by name or email (for task assignment)
 * @route   GET /api/users/search?q=query
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude self
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name email')
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching users',
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  searchUsers,
};
