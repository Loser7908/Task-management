import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Card, Container, Row, Col, Form, Modal, Spinner, Toast } from 'react-bootstrap';
import TaskCard from './TaskCard';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, updateTaskStatus } from '../redux/slices/taskSlice';
import { api } from '../utils/api';

const TaskBoard = ({ onTaskUpdate }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
  });
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    dispatch(fetchTasksStart());
    try {
      const data = await api.get('/tasks');
      dispatch(fetchTasksSuccess(data));
    } catch (error) {
      dispatch(fetchTasksFailure(error.message));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const createdTask = await api.post('/tasks', newTask);
      dispatch({ type: 'tasks/addTask', payload: createdTask });
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If dropped outside a droppable area or no movement
    if (!destination || (source.droppableId === destination.droppableId)) {
      return;
    }

    // Only users can update task status
    if (user?.role === 'user') {
      try {
        await api.put(`/tasks/${draggableId}`, {
          status: destination.droppableId,
        });

        dispatch(updateTaskStatus({
          taskId: draggableId,
          newStatus: destination.droppableId,
        }));
      } catch (error) {
        setErrorToast({ show: true, message: 'Error updating task status.' });
        console.error('Error updating task status:', error);
      }
    } else {
      setErrorToast({ show: true, message: 'Only users can change task status.' });
    }
  };

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  
  const columns = {
    todo: {
      title: 'To Do',
      items: tasksArray.filter((task) => task?.status === 'todo'),
    },
    'in-progress': {
      title: 'In Progress',
      items: tasksArray.filter((task) => task?.status === 'in-progress'),
    },
    completed: {
      title: 'Completed',
      items: tasksArray.filter((task) => task?.status === 'completed'),
    },
  };

  if (loading) {
    return (
      <div className="loading-spinner d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message text-danger text-center py-3">
        {error}
      </div>
    );
  }

  return (
    <div className="kanban-bg py-4 px-2" style={{ minHeight: '80vh', background: '#f7f8fa', borderRadius: '12px' }}>
      <Container fluid>
        <Row className="mb-4 align-items-center">
          <Col xs={12} md={6} className="mb-2 mb-md-0">
            {user?.role === 'admin' && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                className="shadow-sm px-4 py-2"
                style={{ fontWeight: 500, fontSize: '1.1rem' }}
              >
                + Create Task
              </Button>
            )}
          </Col>
        </Row>

        <DragDropContext onDragEnd={onDragEnd}>
          <Row className="gy-4">
            {Object.entries(columns).map(([columnId, column]) => (
              <Col key={columnId} xs={12} md={4}>
                <Card className="shadow-sm h-100" style={{ minHeight: '70vh', background: '#fff', borderRadius: '16px' }}>
                  <Card.Header className="bg-white border-0 pb-2 pt-3">
                    <h5 className="mb-0" style={{ fontWeight: 600 }}>{column.title}</h5>
                  </Card.Header>
                  <Card.Body className="p-2" style={{ minHeight: '60vh' }}>
                    <Droppable 
                      droppableId={columnId}
                      isDropDisabled={user?.role !== 'user'}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`task-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                          style={{
                            minHeight: '60vh',
                            padding: '8px',
                            backgroundColor: snapshot.isDraggingOver ? '#f8f9fa' : 'transparent',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          {column.items.length === 0 && (
                            <div className="text-center text-muted py-4">No tasks</div>
                          )}
                          {column.items.map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                              isDragDisabled={user?.role !== 'user'}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    marginBottom: '8px',
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                    transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                                  }}
                                >
                                  <TaskCard task={task} onTaskUpdate={onTaskUpdate} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </DragDropContext>
      </Container>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Toast
        onClose={() => setErrorToast({ show: false, message: '' })}
        show={errorToast.show}
        delay={3000}
        autohide
        style={{ position: 'fixed', bottom: 20, right: 20, minWidth: 200, zIndex: 9999 }}
        bg="danger"
      >
        <Toast.Body className="text-white">{errorToast.message}</Toast.Body>
      </Toast>
    </div>
  );
};

export default TaskBoard;
