export interface Props {
  type: string;

  data: number[];
  maxidx: number;
  compareidx: number;
  messageId: string;

  newData: number[];
  number: number; //用于(2) searching whether a particular number appear in the list
}
