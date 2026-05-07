//export async function moderateMessage(text: string): Promise<boolean> {
 // const apiKey = process.env.NEXT_PUBLIC_PERSPECTIVE_API_KEY

//  const response = await fetch(
  //  `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
  //  {
    //  method: 'POST',
    //  headers: { 'Content-Type': 'application/json' },
    //  body: JSON.stringify({
    //    comment: { text },
    //    languages: ['en', 'de'],
    //    requestedAttributes: { TOXICITY: {} },
    //  }),
   // }
 // )

 // const data = await response.json()
 // const score = data.attributeScores?.TOXICITY?.summaryScore?.value ?? 0

//  return score < 0.7
// }

export async function moderateMessage(text: string): Promise<boolean> {
  // Temporary: allow all messages
  return true
}