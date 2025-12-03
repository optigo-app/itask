import MetaData from './MetaData';
import { useLocation } from 'react-router-dom';

const MetaDataSet = () => {
  const location = useLocation();

  const metadata = {
    "/": {
      title: "Home - Task Management System",
      description: "Effortlessly manage and track your tasks with our powerful task management system.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "task management, productivity, dashboard, to-do list, workflow",
      url: window.location.href,
    },
    "/account-profile": {
      title: "User Profile - Manage Your Account",
      subtitle: "Update your personal details, preferences, and security settings.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "user profile, account settings, profile management, user details",
      url: window.location.href,
    },
    "/account-settings": {
      title: "Account Settings - Customize Your Experience",
      subtitle: "Configure notifications, preferences, and security settings.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "account settings, profile, preferences, security, user control",
      url: window.location.href,
    },
    "/tasks": {
      title: "Task Page - Organize Your Work",
      description: "Create, assign, and track tasks efficiently with our task management tool.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "task management, to-do list, productivity, project planning",
      url: window.location.href,
    },
    "/bugtrack": {
      title: "Bug Track Page - Organize Your Work",
      description: "Create, assign, and track tasks efficiently with our task management tool.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "task management, to-do list, productivity, project planning",
      url: window.location.href,
    },
    "/projects": {
      title: "Project Management - Streamline Your Workflow",
      description: "Manage your projects with ease, collaborate with your team, and track progress.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "project management, team collaboration, agile workflow, milestones",
      url: window.location.href,
    },
    "/meetings": {
      title: "Meeting Scheduler - Stay Organized",
      description: "Schedule, track, and manage your meetings seamlessly with built-in reminders.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "meeting scheduler, calendar, task tracking, team meetings",
      url: window.location.href,
    },
    "/myCalendar": {
      title: "Calendar View - Plan Your Schedule",
      description: "View all your tasks, deadlines, and meetings in one easy-to-use calendar interface.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "calendar, task scheduling, productivity planner, agenda, events",
      url: window.location.href,
    },
    "/masters": {
      title: "Master Data Management - Control Your System",
      description: "Manage essential master data including roles, users, categories, and configurations.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "master data, admin control, system management, user roles",
      url: window.location.href,
    },
    "/inbox": {
      title: "Task Inbox - Stay Updated",
      description: "Check pending tasks, receive updates, and take action on important assignments.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "task inbox, notifications, task updates, workflow, alerts",
      url: window.location.href,
    },
    "/reports": {
      title: "Reports - Stay Updated",
      description: "Check pending tasks, receive updates, and take action on important assignments.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "task inbox, notifications, task updates, workflow, alerts, Reports",
      url: window.location.href,
    },
    "/milestoneReport": {
      title: "Module Milestone Report - Stay Updated",
      description: "Check pending tasks, receive updates, and take action on important assignments.",
      image: window.location.origin + '/static/media/tecotask.d889fb524f89f048a45c.png',
      keywords: "task inbox, notifications, task updates, workflow, alerts, Reports",
      url: window.location.href,
    },
  };

  const currentPath = location.pathname;
  const matchedKey = Object.keys(metadata)
    ?.filter((key) => currentPath.startsWith(key))
    ?.sort((a, b) => b.length - a.length)[0] || "/";

  const pageMetadata = metadata[matchedKey] || {};

  return (
    <>
      <MetaData
        title={pageMetadata.title}
        description={pageMetadata.description}
        image={pageMetadata.image}
        keywords={pageMetadata.keywords}
        url={pageMetadata.url}
      />
    </>
  );
};

export default MetaDataSet;
