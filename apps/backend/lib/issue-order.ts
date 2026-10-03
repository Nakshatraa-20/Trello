type IssuePosition = {
    id: number;
    position: number;
  };
  
  export function getOrderedIssueIds(
    destinationIssues: IssuePosition[],
    movingIssueId: number,
    beforeIssueId: number | null,
  ): number[] {
    
    const orderedIds = destinationIssues
      .filter((issue) => issue.id !== movingIssueId)
      .sort((a, b) => a.position - b.position || a.id - b.id)
      .map((issue) => issue.id);
  
   
    if (beforeIssueId === null) {
      orderedIds.push(movingIssueId);
      return orderedIds;
    }
  
   
    const insertionIndex = orderedIds.indexOf(beforeIssueId);
  
    if (insertionIndex === -1) {
      throw new Error("The target issue is no longer in this section.");
    }
  
   
    orderedIds.splice(insertionIndex, 0, movingIssueId);
  
    return orderedIds;
  }