import prisma from "./index"

async function main(){
    const sections= await prisma.section.findMany({
        include:{
            issues:{
                orderBy:{
                    id:"asc",
                },
            },
        },
    })

    for(const section of sections){
        await prisma.$transaction(
            section.issues.map((issue,index)=>
            prisma.issue.update({
                where:{
                    id:issue.id
                },
                data:{
                    position:index,
                }
            }))
        )
        console.log(
            `Updated ${section.issues.length} tasks in section ${section.id}`
          );
    }
    console.log("Initial positions saved.")
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });