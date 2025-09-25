import { supabase } from "@/services/supabaseClient";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { jobPosition, jobDescription, duration, interviewType, questions, createdBy } = await req.json();
        
        // Generate unique interview ID
        const interviewId = uuidv4();
        
        // Save interview to database
        const { data: interview, error } = await supabase
            .from('Interviews')
            .insert([
                {
                    id: interviewId,
                    job_position: jobPosition,
                    job_description: jobDescription,
                    duration: duration,
                    interview_type: interviewType,
                    questions: questions,
                    created_by: createdBy,
                    created_at: new Date().toISOString(),
                    status: 'active'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: "Failed to save interview" }, { status: 500 });
        }

        // Generate interview link
        const interviewLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/interview/${interviewId}`;

        return NextResponse.json({ 
            success: true, 
            interview: interview,
            interviewLink: interviewLink,
            interviewId: interviewId
        });

    } catch (error) {
        console.error('Error saving interview:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}