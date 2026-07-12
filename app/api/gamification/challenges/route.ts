import {NextResponse}  from 'next/server';
import {prisma} from "@/lib/db";

export async function GET(){
    try{
        const activeChallenges = await prisma.challenge.findMany({
            where: {
                status : 'ACTIVE',
            },
            orderBy: {
                endDate: 'asc',
            }
        });
        return NextResponse.json(activeChallenges, {status:200});
    } catch(error){
        console.log('Error fetching challenges: ', error);
        return NextResponse.json(
            {
                error: 'Failed to retrieve challeanges from data layer'
            },
            {status : 500}
        );
    }
}