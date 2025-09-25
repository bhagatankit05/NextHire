import axios from 'axios';
import { Loader2Icon, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUser } from '@/app/provider';

const QuestionList = ({ formData }) => {

    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [interviewLink, setInterviewLink] = useState('');
    const [interviewSaved, setInterviewSaved] = useState(false);
    const { user } = useUser();

    useEffect(()=>{
        if (formData) {
            GenerateQuestionList();
        }
    },[formData])

    const GenerateQuestionList=async ()=>{
        setLoading(true);
        try{
            const result = await axios.post('/api/ai-model',{...formData});
            
            if (result.data && result.data.questions) {
                let questionsList = [];
                try {
                    // Parse the AI response to extract questions
                    const content = result.data.questions.content;
                    const jsonMatch = content.match(/interviewQuestions\s*=\s*(\[[\s\S]*?\])/);
                    if (jsonMatch) {
                        questionsList = JSON.parse(jsonMatch[1]);
                    }
                } catch (parseError) {
                    console.error('Error parsing questions:', parseError);
                    toast('Error parsing generated questions');
                }
                
                setQuestions(questionsList);
                
                // Save interview to database
                if (questionsList.length > 0) {
                    await SaveInterview(questionsList);
                }
            }
            setLoading(false);
        }catch(error){
          console.error('Error generating questions:', error);
          toast('Server Error, Try Again Later!');
          setLoading(false);
        }
    }

    const SaveInterview = async (questionsList) => {
        try {
            const saveResult = await axios.post('/api/save-interview', {
                ...formData,
                questions: questionsList,
                createdBy: user?.email || 'anonymous'
            });

            if (saveResult.data.success) {
                setInterviewLink(saveResult.data.interviewLink);
                setInterviewSaved(true);
                toast.success('Interview created successfully!');
            }
        } catch (error) {
            console.error('Error saving interview:', error);
            toast.error('Failed to save interview');
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(interviewLink);
        toast.success('Interview link copied to clipboard!');
    }
  return (
    <div className="space-y-6">
      {loading && 
        <div className='p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3'>
          <Loader2Icon className='animate-spin'/>
          <div>
            <h2>Generating Interview Questions...</h2>
            <p>Our AI is Crafting questions based on your job position</p>
          </div>
        </div>
      }

      {/* Interview Link Section */}
      {interviewSaved && interviewLink && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-green-800">Interview Created Successfully!</h2>
          </div>
          <p className="text-sm text-green-700 mb-3">
            Share this link with candidates to start the interview:
          </p>
          <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
            <input 
              type="text" 
              value={interviewLink} 
              readOnly 
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button 
              size="sm" 
              onClick={() => window.open(interviewLink, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="p-5 bg-white border rounded-xl shadow-sm">
          <h2 className="font-bold text-xl mb-4">Generated Interview Questions</h2>
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {q.type}
                  </span>
                </div>
                <p className="text-gray-700">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionList
