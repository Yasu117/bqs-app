import { RouterProvider } from 'react-router';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { router } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <DndProvider
      backend={TouchBackend}
      options={{
        enableMouseEvents: true,
      }}
    >
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </DndProvider>
  );
}