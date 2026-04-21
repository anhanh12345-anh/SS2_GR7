import React, { useState, useEffect } from 'react';
import { reminderAPI } from '../services/api';
import { Card, Modal, Input, EmptyState } from '../components/ui';
import Button from '../components/ui/Button';
import { formatDate } from '../utils';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';


import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';



const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    dueDate: ''
  });

  // ================= API =================
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await reminderAPI.getAll();
      setReminders(res.data.data);
    } catch {
      toast.error('Lỗi tải nhắc nhở');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // ================= CALENDAR =================
  const events = reminders
    .filter(r => r.dueDate)
    .map(r => ({
      id: r._id,
      title: r.title,
      start: new Date(r.dueDate),
      end: new Date(r.dueDate),
      completed: r.isCompleted,
      raw: r
    }));

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.completed ? '#999' : 'var(--accent)',
      opacity: event.completed ? 0.4 : 1,
      borderRadius: '8px',
      border: 'none',
      color: '#fff',
      fontSize: '0.75rem'
    }
  });

  //  Click ngày → tạo
  const handleSelectSlot = (slotInfo) => {
    setForm({
      title: '',
      dueDate: moment(slotInfo.start).format('YYYY-MM-DD')
    });
    setEditItem(null);
    setModalOpen(true);
  };

  // Drag → đổi ngày
  const moveEvent = async ({ event, start }) => {
    try {
      await reminderAPI.update(event.id, { dueDate: start });
      fetchReminders();
      toast.success('Đã cập nhật ngày');
    } catch {
      toast.error('Lỗi kéo thả');
    }
  };

  // Click event → edit
  const handleSelectEvent = (event) => {
    openModal(event.raw);
  };

  // ================= CRUD =================
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        title: item.title,
        dueDate: moment(item.dueDate).format('YYYY-MM-DD')
      });
    } else {
      setEditItem(null);
      setForm({
        title: '',
        dueDate: moment().format('YYYY-MM-DD')
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.title) {
      toast.error('Nhập tiêu đề');
      return;
    }

    if (!form.dueDate) {
      toast.error('Chọn ngày nhắc nhở');
      return;
    }

    setSaving(true);
    try {
      if (editItem) {
        await reminderAPI.update(editItem._id, form);
      } else {
        await reminderAPI.create(form);
      }
      setModalOpen(false);
      fetchReminders();
    } catch {
      toast.error('Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (r) => {
    try {
      await reminderAPI.update(r._id, {
        isCompleted: !r.isCompleted
      });
      fetchReminders();
    } catch {
      toast.error('Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa nhắc nhở này?')) return;
    try {
      await reminderAPI.delete(id);
      fetchReminders();
      toast.success('Đã xóa');
    } catch {
      toast.error('Lỗi xóa');
    }
  };

  const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToToday = () => toolbar.onNavigate('TODAY');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={goToToday} className="rbc-btn">Today</button>
        <button onClick={goToBack} className="rbc-btn">{'<'}</button>
        <button onClick={goToNext} className="rbc-btn">{'>'}</button>
      </div>

      <span style={{ fontWeight: 600 }}>
        {toolbar.label}
      </span>

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => toolbar.onView('month')}>Month</button>
        <button onClick={() => toolbar.onView('week')}>Week</button>
        <button onClick={() => toolbar.onView('day')}>Day</button>
      </div>
    </div>
  );
};

  // ================= DATA =================
  const upcoming = reminders.filter(r => !r.isCompleted);
  const completed = reminders.filter(r => r.isCompleted);

  // ================= UI =================
  return (
    <div className="fade-in">

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            fontWeight: 800
          }}>
            Nhắc Nhở
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            Quản lý công việc và lịch
          </p>
        </div>

        <Button onClick={() => openModal()} icon={<Plus size={14} />}>
          Thêm nhắc nhở
        </Button>
      </div>

      {/* MAIN */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 20
      }}>

        {/* CALENDAR */}
        <Card style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)'
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>
            Lịch cá nhân
          </h3>

          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}

            selectable
            onSelectSlot={handleSelectSlot}
            onEventDrop={moveEvent}
            onSelectEvent={handleSelectEvent}

            eventPropGetter={eventStyleGetter}
          />
        </Card>

        {/* TODO */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>

          <Card style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>
              Công việc ({upcoming.length})
            </h3>

            {upcoming.length === 0 ? (
              <EmptyState
                title="Không có công việc"
                description="Thêm để bắt đầu"
              />
            ) : (
              upcoming.map(r => (
                <div key={r._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: 12,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  marginBottom: 8
                }}>
                  <button
                    onClick={() => toggleComplete(r)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid var(--border)',
                      cursor: 'pointer'
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {r.title}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--text-muted)'
                    }}>
                      {r.dueDate && formatDate(r.dueDate)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* COMPLETED */}
          {completed.length > 0 && (
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 10 }}>
                Hoàn thành
              </h3>

              {completed.map(r => (
                <div key={r._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: 0.5,
                  marginBottom: 6,
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={14} />
                    <span style={{ textDecoration: 'line-through' }}>
                      {r.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(r._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--red)',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.7}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </Card>
          )}

        </div>

      </div>

      {/* MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <Input
            label="Tiêu đề"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <Input
            type="date"
            label="Ngày"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
          />

          <Button type="submit" loading={saving}>
            {editItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        </form>
      </Modal>

    </div>
  );
};

export default Reminders;