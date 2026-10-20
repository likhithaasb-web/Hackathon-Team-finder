import Task from '../models/Task.js';
import Team from '../models/Team.js';
import ProjectActivity from '../models/ProjectActivity.js';

export const getTasks = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // Check membership
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    const isMember = team.members.some(m => m.user.toString() === userId.toString());
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team members can access tasks.' });
    }

    const tasks = await Task.find({ team: teamId })
      .populate('assignedTo', 'fullName username avatarUrl')
      .populate('createdBy', 'fullName username avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const userId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    const isMember = team.members.some(m => m.user.toString() === userId.toString());
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team members can create tasks.' });
    }

    const task = await Task.create({
      team: teamId,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      createdBy: userId,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'fullName username avatarUrl')
      .populate('createdBy', 'fullName username avatarUrl');

    await ProjectActivity.create({
      team: teamId,
      user: userId,
      action: 'Task Created',
      details: `${req.user.fullName} created task "${title}".`,
    });

    res.status(201).json({
      success: true,
      task: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const team = await Team.findById(task.team);
    const isMember = team && team.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team members can edit tasks.' });
    }

    const prevStatus = task.status;
    const updated = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'fullName username avatarUrl')
      .populate('createdBy', 'fullName username avatarUrl');

    if (req.body.status && req.body.status !== prevStatus) {
      await ProjectActivity.create({
        team: task.team,
        user: req.user._id,
        action: 'Task Moved',
        details: `${req.user.fullName} moved "${task.title}" to ${req.body.status.toUpperCase()}.`,
      });
    }

    res.status(200).json({
      success: true,
      task: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const team = await Team.findById(task.team);
    const isMember = team && team.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task.' });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted.',
    });
  } catch (error) {
    next(error);
  }
};
