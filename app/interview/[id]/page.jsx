"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewPage() {
    const params = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [candidateInfo, setCandidateInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [interviewStarted, setInterviewStarted] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchInterview();
        }
    }, [params.id]);

    const fetchInterview = async () => {
        try {
            const { data, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('id', params.id)
                .eq('status', 'active')
                .single();

            if (error) {
                console.error('Error fetching interview:', error);
                toast.error('Interview not found or has expired');
                return;
            }

            setInterview(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load interview');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setCandidateInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const startInterview = () => {
        if (!candidateInfo.name || !candidateInfo.email) {
            toast.error('Please fill in your name and email');
            return;
        }
        setInterviewStarted(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading interview...</p>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Interview Not Found</h1>
                    <p className="text-gray-600">This interview link may have expired or is invalid.</p>
                </div>
            </div>
        );
    }

    if (!interviewStarted) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome to Your Interview
                            </h1>
                            <p className="text-gray-600">
                                Please provide your information to begin
                            </p>
                        </div>

                        {/* Interview Details */}
                        <div className="bg-blue-50 rounded-lg p-6 mb-8">
                            <h2 className="font-semibold text-blue-900 mb-4">Interview Details</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Briefcase className="h-5 w-5" />
                                    <span className="font-medium">Position:</span>
                                    <span>{interview.job_position}</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Clock className="h-5 w-5" />
                                    <span className="font-medium">Duration:</span>
                                    <span>{interview.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-800">
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">Type:</span>
                                    <span>{Array.isArray(interview.interview_type) ? interview.interview_type.join(', ') : interview.interview_type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Information Form */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <Input
                                    placeholder="Enter your full name"
                                    value={candidateInfo.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={candidateInfo.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (Optional)
                                </label>
                                <Input
                                    placeholder="Enter your phone number"
                                    value={candidateInfo.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            </div>

                            <Button 
                                onClick={startInterview}
                                className="w-full"
                                size="lg"
                            >
                                Start Interview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Interview Started View
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {interview.job_position} Interview
                        </h1>
                        <p className="text-gray-600">
                            Welcome {candidateInfo.name}! Please answer the following questions.
                        </p>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {interview.questions && interview.questions.map((question, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-semibold text-lg text-gray-900">
                                        Question {index + 1}
                                    </h3>
                                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        {question.type}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-4">{question.question}</p>
                                <Textarea
                                    placeholder="Type your answer here..."
                                    className="min-h-[120px]"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Button size="lg" className="px-8">
                            Submit Interview
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}