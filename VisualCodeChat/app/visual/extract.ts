export function extractArrayFromString(text: string): number[] {
  const withoutQuotes = text.replace(/`/g, " ");
  const pattern: RegExp = /\[\s*(\d+\s*(?:,\s*\d+\s*)*)\]/g;
  // const pattern: RegExp = /\[([^\]]*)\]/;
  let match: RegExpMatchArray | null = null;
  let matchedString: string | null = null;

  // 寻找所有匹配项，找到最后一个匹配项
  while ((match = pattern.exec(withoutQuotes)) !== null) {
    matchedString = match[0];
    console.log("现在的match:", matchedString);
    const lastArray: number[] = JSON.parse(matchedString);
    if (lastArray.length >= 4) {
      console.log("match 到了，", lastArray);
      return lastArray;
    }
    if (lastArray.length === 5) {
      break;
    }
  }
  return [1];
}

export function contains5ElementList(str: string): boolean {
  return str.toLowerCase().includes("five_element_list".toLowerCase());
}

export function getSteps(str_msg: string, str: string): boolean {
  return str_msg.toLowerCase().includes(str.toLowerCase());
}
