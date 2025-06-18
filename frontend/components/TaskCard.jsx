import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { updateTask, deleteTask } from '../redux/slices/taskSlice';
import { api } from '../utils/api';

const TaskCard = ({ task, onTaskUpdate }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  });

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = await api.put(`/tasks/${task._id}`, editedTask);
      dispatch(updateTask(updatedTask));
      setShowEditModal(false);
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${task._id}`);
        dispatch(deleteTask(task._id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'todo': 'primary',
      'in-progress': 'warning',
      'completed': 'success'
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Card className="task-card" onClick={() => setShowEditModal(true)} style={{ cursor: 'pointer' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="mb-0">{task.title}</h6>
            <div className="d-flex gap-1">
              {user?.role === 'admin' && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted small mb-2">{task.description}</p>
          <div className="d-flex justify-content-between align-items-center">
            {task.dueDate && (
              <div className="d-flex align-items-center text-muted small">
                <i className="bi bi-calendar me-1"></i>
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {getStatusBadge(task.status)}
          </div>
          <div className="mt-2">
            <small className="text-muted">
              Created by: {task.createdBy?.email || 'Unknown'}
            </small>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={editedTask.dueDate}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TaskCard;
