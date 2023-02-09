
import Projects from './pages/projects/_.vue';
import AppHome from './pages/app/_.vue';


export const routes = [
    { path: '/', component: Projects },
    { path: '/app/:projectId/:boardId/:viewId?', name: 'app-home', component: AppHome  },
]
