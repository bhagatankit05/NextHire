"use client"

import { Button } from '@/components/ui/button';
import { Camera, Video, ExternalLink, Copy, Calendar, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/provider';
import { toast } from 'sonner';
import Link from 'next/link';

const LatestInterviewsList = () => {
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user?.email) {
            fetchInterviews();
        }
    }, [user]);

    const fetchInterviews = async () => {
        try {
            const { data, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('created_by', user.email)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching interviews:', error);
                return;
            }

            setInterviewList(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyInterviewLink = (interviewId) => {
        const link = `${window.location.origin}/interview/${interviewId}`;
        navigator.clipboard.writeText(link);
        toast.success('Interview link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className='my-5'>
                <h2 className='font-bold text-2xl'>Previously Created Interviews</h2>
                <div className='p-5 flex items-center justify-center mt-5'>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className='my-5'>
            <h2 className='font-bold text-2xl'>Previously Created Interviews</h2>
            {interviewList?.length === 0 ? (
                <div className='p-5 flex flex-col gap-3 items-center mt-5' >
                    <Video className='h-10 w-10 text-primary'/>
                    <h2>You haven't created any interviews so far!</h2>
                    <Link href='/dashboard/create-interview'>
                        <Button>+ Create New Interview</Button>
                    </Link>
                </div>
            ) : (
                <div className='mt-5 space-y-4'>
                    {interviewList.map((interview, index) => (
                        <div key={interview.id} className='bg-white border border-gray-200 rounded-lg p-5'>
                            <div className='flex justify-between items-start'>
                                <div className='flex-1'>
                                    <h3 className='font-semibold text-lg text-gray-900 mb-2'>
                                        {interview.job_position}
                                    </h3>
                                    <div className='flex items-center gap-4 text-sm text-gray-600 mb-3'>
                                        <div className='flex items-center gap-1'>
                                            <Clock className='h-4 w-4' />
                                            <span>{interview.duration} min</span>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <Calendar className='h-4 w-4' />
                                            <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                                            {interview.status}
                                        </span>
                                    </div>
                                    <p className='text-gray-700 text-sm line-clamp-2'>
                                        {interview.job_description}
                                    </p>
                                </div>
                                <div className='flex gap-2 ml-4'>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyInterviewLink(interview.id)}
                                        className="flex items-center gap-1"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copy Link
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => window.open(`/interview/${interview.id}`, '_blank')}
                                        className="flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className='text-center mt-6'>
                        <Link href='/dashboard/create-interview'>
                            <Button>+ Create New Interview</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LatestInterviewsList
