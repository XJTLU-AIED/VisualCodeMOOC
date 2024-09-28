export type graphType = {
  nodes: Array<{
    id: string;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
  currentNodes?: Array<{
    source: string;
    target: string;
  }>;
  currentDFSpaths?:Array<string>; 
  visitedNodes?: Array<string>; 
  connectedPath?: Array<string>; 
  connectedComponents?: Array<Array<number>>; 
};


export interface Props {
  type: string;

  data: number[];
  maxidx: number;
  compareidx: number;
  messageId: string;

  newData: number[];
  number: number; //searching whether a particular number appear in the list

  json?: graphType;
}
