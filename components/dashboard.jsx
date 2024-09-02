'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import UploadButton from './uploadbutton';
import { Ghost, Loader2, MessageSquare, Plus, Trash } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import FileUpload from './fileUpload';

const Dashboard = ({ subscriptionPlan }) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfData, setPDFData] = useState();

  // Fetch files when component mounts
  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('/api/pdf');
        const data = await res.json();
        console.log(data);
        setFiles(data.files);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, []);

  const handleDelete = async (id) => {
    setCurrentlyDeletingFile(id);
    try {
      const res = await fetch(`/api/pdf/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFiles(files.filter((file) => file._id !== id));
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    } finally {
      setCurrentlyDeletingFile(null);
    }
  };

  return (
    <main className='mx-auto max-w-7xl md:p-10'>
      <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
        <h1 className='mb-3 font-bold text-5xl text-gray-900'>My Files</h1>
        {/* <UploadButton isSubscribed={subscriptionPlan.isSubscribed} /> */}
        <FileUpload setPdfFiles={setPdfFiles} setPDFData={setPDFData} />
      </div>

      {files.length > 0 ? (
        <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                <Link href={`/dashboard/${file._id}`} className='flex flex-col gap-2'>
                  <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                    <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' />
                    <div className='flex-1 truncate'>
                      <div className='flex items-center space-x-3'>
                        <h3 className='truncate text-lg font-medium text-zinc-900'>
                          {file.filename}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                  <div className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    {format(new Date(file.createdAt), 'MMM yyyy')}
                  </div>
                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    mocked
                  </div>
                  <Button
                    onClick={() => handleDelete(file._id)}
                    size='sm'
                    className='w-full'
                    variant='destructive'>
                    {currentlyDeletingFile === file._id ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className='my-2' count={3} />
      ) : (
        <div className='mt-16 flex flex-col items-center gap-2'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>Pretty empty around here</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
