import React from 'react';
import MetaData from './MetaData';
import { useLocation } from 'react-router-dom';

const metadata = {
  '/': {
    title: 'Home - Task Management',
    description: 'Manage your tasks efficiently.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'task, home, management',
    url: window.location.href,
  },
  '/tasks': {
    title: 'Tasks - Task Management',
    description: 'View and manage your Tasks.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'projects, task management',
    url: window.location.href,
  },
  '/projects': {
    title: 'Projects - Task Management',
    description: 'View and manage your projects.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'projects, task management',
    url: window.location.href,
  },
  '/meetings': {
    title: 'Meetings - Task Management',
    description: 'Schedule and track your meetings.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'meetings, task management',
    url: window.location.href,
  },
  '/calendar': {
    title: 'Calendar - Task Management',
    description: 'View your tasks on the calendar.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'calendar, tasks',
    url: window.location.href,
  },
  '/masters': {
    title: 'Masters - Task Management',
    description: 'Manage master data.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'masters, task management',
    url: window.location.href,
  },
  '/inbox': {
    title: 'Inbox - Task Management',
    description: 'Check your task inbox.',
     image: 'https://example.com/home-image.jpg',
    keywords: 'inbox, task management',
    url: window.location.href,
  },
};

const MetaDataSet = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageMetadata = metadata[currentPath] || {};


  return (
    <>
      <MetaData
        title={pageMetadata.title}
        description={pageMetadata.description}
        keywords={pageMetadata.keywords}
        url={pageMetadata.url}
      />
    </>
  );
};

export default MetaDataSet;
