export function extractArrayFromString(text: string): number[] {
  const withoutQuotes = text.replace(/`/g, " ");
  const pattern: RegExp = /[\[\{]\s*(\d+\s*(?:,\s*\d+\s*)*)[\]\}]/g;
  let match: RegExpMatchArray | null = null;
  let matchedString: string | null = null;

  while ((match = pattern.exec(withoutQuotes)) !== null) {
    matchedString = match[0];
    const get_list_ = matchedString.replace(/{/g, "[");
    const get_list = get_list_.replace(/}/g, "]");
    const lastArray: number[] = JSON.parse(get_list);
    if (lastArray.length >= 4) {
      return lastArray;
    }
  }
  return [1];
}

export function extractJSONContent(input: string): string {
  const regex = /<!--([\s\S]*?)-->/g;
  const match = input.match(regex);
  if (match) {
      const remaining = input.replace(regex, ''); 
      return remaining;
  }
  return input; 
}
export function extractJSONContent_original(input: string): { extracted: string | null; remaining: string } {
  const regex = /<!--([\s\S]*?)-->/g;
  const match = input.match(regex);
  if (match) {
      const extracted_ = match[0]; 
      const remaining = input.replace(regex, ''); 
      const extracted = extracted_.replace("<!--", "").replace("-->", "");
      return { extracted, remaining };
  }
  return { extracted: null, remaining: input }; 
}

export function extractLastArrayFromString(text: string): number[] {
  const pattern: RegExp = /[\[\{]\s*(\d+\s*(?:,\s*\d+\s*)*)[\]\}]/g;
  let match: RegExpMatchArray | null = null;
  let lastMatchedString: string | null = null;

  while ((match = pattern.exec(text)) !== null) {
    lastMatchedString = match[1];
  }
  if (lastMatchedString) {
    const lastArray: number[] = lastMatchedString.split(",").map(Number);
    if (lastArray.length >= 5) {
      return lastArray;
    }
    return [1];
  } else {
    return [1];
  }
}

export function contains5ElementList(str: string): boolean {
  const a = str.toLowerCase().includes("five_element_list".toLowerCase());
  const b = str.toLowerCase().includes("fiveElementArray".toLowerCase());
  if (a || b) {
    return true;
  }
  return false;
}

export function getSteps(str_msg: string, str: string): boolean {
  return str_msg.toLowerCase().includes(str.toLowerCase());
}

export function extractForBinary(str: string): number {
  const a = str.toLowerCase().includes("startIndex = 0".toLowerCase());
  const b = str.toLowerCase().includes("startIndex = 1".toLowerCase());
  const c = str.toLowerCase().includes("startIndex = 2".toLowerCase());
  const d = str.toLowerCase().includes("endIndex = 1".toLowerCase());
  const e = str.toLowerCase().includes("endIndex = 5".toLowerCase());
 

  if (c && d){
    return 4;
  }
  else if (b && d){
    return 3;
  }
  else if (a && d){
    return 2;
  }
  else if (a && e) {
    return 1;
  }
  return 0;
}
