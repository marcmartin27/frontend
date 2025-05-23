// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import Sidebar from './Sidebar';
import TeamSection from './TeamSection';
import UsersSection from './UsersSection';
import CoachTeamSection from './CoachTeamSection';
import AttendanceSection from './AttendanceSection';
import MyTasksSection from './MyTasksSection';
import '../../styles/main.scss';
import MinutesSection from './MinutesSection';
import MySessions from './MySessions';
import AdminTasksSection from './AdminTasksSection';
import AdminSessionsSection from './AdminSessionsSection';
import AdminMinutesSection from './AdminMinutesSection';
import AdminAttendanceSection from './AdminAttendanceSection';
import CoachInicio from './CoachInicio';
import AdminDashboardHome from './AdminDashboardHome'; 


function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: '', city: '', founded: '' });
  const [userForm, setUserForm] = useState({ username: '', email: '', role: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState([]);

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/users/', {
        headers: authHeader()
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error cargando usuarios: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    // Cargar datos del usuario
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    // Asegurarnos que la página activa sea 'dashboard' al inicio
    setActivePage('dashboard');
    
    if (userData) {
      if (userData.role === 'admin') {
        // Cargar datos para admin...
      } else {
        // Cargar datos para coach...
      }
    }
    
    // Cargar equipos
    loadTeams();
  }, []);

  // Asegurarse de recargar usuarios cada vez que se active la sección de gestión de usuarios
  useEffect(() => {
    if (activePage === 'users') {
      loadUsers();
    }
  }, [activePage]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/teams/', {
        headers: authHeader()
      });
      
      if (!response.ok) {
        const clonedResponse = response.clone();
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          const textError = await clonedResponse.text();
          throw new Error(`Error ${response.status}: ${textError.substring(0, 100)}...`);
        }
      }
      
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error cargando equipos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = e => {
    setTeamForm({ ...teamForm, [e.target.name]: e.target.value });
  };

  const handleUserChange = e => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleTeamSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/teams/create/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamForm)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      // Limpiar el formulario y recargar equipos
      setTeamForm({ name: '', city: '', founded: '' });
      loadTeams();
    } catch (err) {
      setError("Error creando equipo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      
      // Validaciones para el rol de entrenador
      if (userForm.role === 'coach' && !userForm.team) {
        setError("Los entrenadores deben tener un equipo asignado");
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      // Limpiar el formulario y recargar usuarios
      setUserForm({ username: '', email: '', role: '', team: '' });
      loadUsers();
    } catch (err) {
      setError("Error creando usuario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Función para obtener las iniciales para el logo del equipo
  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        user={user} 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        activePage={activePage}
        setActivePage={setActivePage}
      />
      
      <div className="main-content">
        <div className="top-bar">
          <h1 className="page-title">
            {/* Modificación para el título de la página de inicio del admin */}
            {user?.role === 'admin' && activePage === 'dashboard' ? 'Inicio Administrador' : 
             user?.role === 'admin' ? 'Panel de Administración' : 
             user?.role === 'coach' && activePage === 'dashboard' ? 'Inicio Entrenador' : 
             'Panel de Entrenador'} | Team Manager
          </h1>
        </div>
          
        {/* Secciones para administradores */}
        {user?.role === 'admin' && (
          <>
            {activePage === 'dashboard' && (
              // Renderiza el nuevo componente de inicio para admin
              <AdminDashboardHome setActivePage={setActivePage} />
            )}
            
            {activePage === 'teams' && (
              <TeamSection 
                teams={teams}
                form={teamForm}
                loading={loading}
                error={error}
                handleChange={handleTeamChange}
                handleSubmit={handleTeamSubmit}
                getInitials={getInitials}
                loadTeams={loadTeams}
              />
            )}
            
            {activePage === 'users' && (
              <UsersSection 
                users={users}
                form={userForm}
                loading={loading}
                error={error}
                handleChange={handleUserChange}
                handleSubmit={handleUserSubmit}
                refreshUsers={loadUsers}
              />
            )}
            {activePage === 'admin-tasks' && (
              <AdminTasksSection />
            )}

            {activePage === 'admin-sessions' && (
              <AdminSessionsSection />
            )}

            {activePage === 'admin-minutes' && (
              <AdminMinutesSection />
            )}
            
            {activePage === 'admin-attendance' && (
              <AdminAttendanceSection />
            )}
          </>
        )}
        
        {/* Secciones para entrenadores */}
        {user?.role === 'coach' && (
          <>
            {activePage === 'dashboard' && (
              <CoachInicio setActivePage={setActivePage} />
            )}
            
            {activePage === 'myteam' && (
              <CoachTeamSection />
            )}
          
            {activePage === 'attendance' && (
              <AttendanceSection />
            )}

            {activePage === 'tasks' && (
              <MyTasksSection />
            )}

            {activePage === 'sessions' && (
              <MySessions />
            )}

            {activePage === 'minutes' && (
              <MinutesSection />
            )}

          </>
        )}
        
        {/* Sección común para todos los usuarios */}
        {activePage === 'settings' && (
          <div className="content-wrapper">
            <h2>Configuración</h2>
            <p>Aquí podrás cambiar tus ajustes personales</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;