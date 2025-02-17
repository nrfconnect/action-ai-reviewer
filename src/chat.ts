import { OpenAI, AzureOpenAI } from 'openai';

export class Chat {
  private openai: OpenAI | AzureOpenAI;
  // private isAzure: boolean;

  constructor(apikey: string) {
    // this.isAzure = Boolean(
    //     process.env.AZURE_API_VERSION && process.env.AZURE_DEPLOYMENT,
    // );

    // if (this.isAzure) {
      // Azure OpenAI configuration
      this.openai = new AzureOpenAI({
        apiKey: apikey,
        endpoint: process.env.OPENAI_API_ENDPOINT || 'https://aitfaihubswede8699771973.openai.azure.com',
        apiVersion: process.env.AZURE_API_VERSION || '2024-08-01-preview',
        deployment: process.env.AZURE_DEPLOYMENT || 'gpt-4o-mini',
      });
    // } 
    // else {
    //   // Standard OpenAI configuration
    //   this.openai = new OpenAI({
    //     apiKey: apikey,
    //     baseURL: process.env.OPENAI_API_ENDPOINT || '',
    //   });
    // }
  }

  private generatePrompt = (patch: string) => {
    const answerLanguage = process.env.LANGUAGE
        ? `Answer me in ${process.env.LANGUAGE},`
        : '';

    const prompt = process.env.PROMPT || `Review the pull request diff. If you find any issues, list them as bullet points with one sentence each.
    Do not add any extra commentary, preamble, or closing remarks.
    If there are no issues, output nothing.
    If possible use github suggestion using syntax
    \`\`\`suggestion
    this is my new suggestion
    \`\`\``;

    return `${prompt}, ${answerLanguage}:
  ${patch}
    `;
  };

  public codeReview = async (patch: string) => {
    if (!patch) {
      return '';
    }

    console.time('code-review cost');
    const prompt = this.generatePrompt(patch);

    const res = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: process.env.MODEL || 'gpt-4o-mini',  
      temperature: +(process.env.temperature || 0) || 1,
      top_p: +(process.env.top_p || 0) || 1,
      max_tokens: process.env.max_tokens ? +process.env.max_tokens : undefined,
    });

    console.timeEnd('code-review cost');

    const tokensUsed = res.usage?.total_tokens || 0;
    const ratePerToken = 0.60 / 1000000; // GPT4o-mini cost
    //const ratePerToken = 0.0015 / 1000;  3.5-turbo
    const cost = tokensUsed * ratePerToken;

    console.log(`tokens used: ${tokensUsed}, estimated cost: $${cost}`);

    if (res.choices.length) {
      return res.choices[0].message.content;
    }

    return '';
  };
}
