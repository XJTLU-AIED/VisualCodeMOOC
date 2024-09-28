import { Props, graphType } from "../components/visual-props";
import { ChatSession } from "./chat";
import {
  extractArrayFromString,
  extractJSONContent_original,
  extractLastArrayFromString,
} from "../visual/extract";
import { contains5ElementList } from "../visual/extract";
import { getSteps } from "../visual/extract";
import { extractForBinary } from "../visual/extract";

const emptyprops: Props = {
  type: "no_animation",
  data: [],
  maxidx: -1,
  compareidx: -1,
  messageId: "",
  newData: [],
  number: -1,
};

function compareArrays(
  arr1: number[],
  arr2: number[],
  arr3: number[],
): boolean {
  //newdata, arrayData, olddata
  let arrA;

  if (arr1.length === 1 && arr1[0] === 0) {
    arrA = arr3;
  } else {
    arrA = arr1;
  }

  let diffCount = 0;
  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arr2[i]) {
      diffCount++;
    }
  }

  // Checks if more than two indices differ in value, and excludes numbers with the same composition
  if (diffCount >= 2 && !arraysHaveSameElements(arrA, arr2)) {
    return true;
  }

  return false;
}

// Checks whether two arrays have the same elements (regardless of order)
function arraysHaveSameElements(arr1: number[], arr2: number[]): boolean {
  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
}

export function getAni(
  session: ChatSession,
  message: string,
  id: string,
): [Props, ChatSession] {
  if (
    session.mask.name == "Bubble Sort"
  ) {
    const extractedData = extractLastArrayFromString(message);
    const arrayData = Array.isArray(extractedData) ? extractedData : [];

    if (arrayData.length == 1 && arrayData[0] == 1) {
      console.log("there is no array in message");
      console.log("olddata:", session.sortdata.oldData);
      console.log("newdata:", session.sortdata.newData);
      return [emptyprops, session]; 
    } else if (
      //First appearance of array in message: display static array
      session.sortdata.oldData.length == 1 &&
      session.sortdata.oldData[0] == 0
    ) {
      console.log("olddata:", session.sortdata.oldData);
      console.log("newdata:", session.sortdata.newData);
      session.sortdata.oldData = arrayData;

      let barchartprops: Props = {
        type: "barchart",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,

        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else if (
      //Back to step 1: Displaying a static array
      compareArrays(
        session.sortdata.newData,
        arrayData,
        session.sortdata.oldData,
      )
    ) {
      console.log("olddata:", session.sortdata.oldData);
      console.log("newdata:", session.sortdata.newData);
      session.sortdata.oldData = arrayData;
      session.sortdata.newData = [0];
      let barchartprops: Props = {
        type: "barchart",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,

        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else {
      console.log("Normal");
      console.log("olddata:", session.sortdata.oldData);
      console.log("newdata:", session.sortdata.newData);
      session.sortdata.newData = arrayData;

      let barchartprops: Props = {
        type: "barchart",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,

        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      session.sortdata.oldData = session.sortdata.newData; 
      return [barchartprops, session];
    }
  }

  // ****************************Selection Sort************************************

  if (session.mask.name == "Selection Sort") {
    const extractedData = extractLastArrayFromString(message);
    const arrayData = Array.isArray(extractedData) ? extractedData : [];

    if (arrayData.length == 1 && arrayData[0] == 1) {
      return [emptyprops, session]; 
    } else if (
      session.sortdata.oldData.length == 1 &&
      session.sortdata.oldData[0] == 0
    ) {
      session.sortdata.oldData = arrayData;

      let barchartprops: Props = {
        type: "selectionSort",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else if (
      compareArrays(
        session.sortdata.newData,
        arrayData,
        session.sortdata.oldData,
      )
    ) {
      session.sortdata.oldData = arrayData;
      session.sortdata.newData = [0];
      let barchartprops: Props = {
        type: "selectionSort",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else {
      console.log("olddata:", session.sortdata.oldData);
      console.log("newdata:", session.sortdata.newData);
      session.sortdata.newData = arrayData;

      let barchartprops: Props = {
        type: "selectionSort",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      session.sortdata.oldData = session.sortdata.newData; 
      return [barchartprops, session];
    }
  }

  // ********************Insertion Sort**************************
  if (session.mask.name == "Insertion Sort") {
    const extractedData = extractLastArrayFromString(message);
    const arrayData = Array.isArray(extractedData) ? extractedData : [];


    if (arrayData.length == 1 && arrayData[0] == 1) {
      return [emptyprops, session]; 
    } else if (
      session.sortdata.oldData.length == 1 &&
      session.sortdata.oldData[0] == 0
    ) {
      session.sortdata.oldData = arrayData;

      let barchartprops: Props = {
        type: "insertionSort",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,

        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else if (
      compareArrays(
        session.sortdata.newData,
        arrayData,
        session.sortdata.oldData,
      )
    ) {
      session.sortdata.oldData = arrayData;
      session.sortdata.newData = [0];
      let barchartprops: Props = {
        type: "insertionSort",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,

        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else {
      session.sortdata.newData = arrayData;

      let barchartprops: Props = {
        type: "insertionSort",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      session.sortdata.oldData = session.sortdata.newData; 
      return [barchartprops, session];
    }
  }

  // ***********************changingAllNumber**************
  if (session.mask.name == "Change Number") {
    const extractedData = extractArrayFromString(message);
    const arrayData = Array.isArray(extractedData) ? extractedData : [];
    if (arrayData.length == 1 && arrayData[0] == 1) {
      return [emptyprops, session]; 
    } else if (
      session.sortdata.oldData.length == 1 &&
      session.sortdata.oldData[0] == 0
    ) {
      session.sortdata.oldData = arrayData;

      let barchartprops: Props = {
        type: "changingAllNumber",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      return [barchartprops, session]; 
    } else {
      session.sortdata.newData = arrayData;

      let barchartprops: Props = {
        type: "changingAllNumber",
        data: session.sortdata.oldData,
        newData: session.sortdata.newData,
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        number: -1,
      };
      session.sortdata.oldData = session.sortdata.newData; 
      return [barchartprops, session];
    }
  }

  // // ****************************findmax*******************
  if (session.mask.name == "FindMax") {
    if (!session.findmaxdata.compare_start && contains5ElementList(message)) {
      if (session.findmaxdata.data.length === 0) {
        const extractedData_f = extractArrayFromString(message);
        const arrayData_f = Array.isArray(extractedData_f)
          ? extractedData_f
          : [];
        if (arrayData_f.length === 5) {
          session.findmaxdata.data = arrayData_f;
        }
      }
    }

    if (getSteps(message, "First")) {
      session.findmaxdata.compare_start = true;
      session.findmaxdata.maxidx = 0;
      session.findmaxdata.compareidx = 1;
      const findmaxprops1: Props = {
        type: "findmax",
        data: session.findmaxdata.data,
        maxidx: session.findmaxdata.maxidx,
        compareidx: session.findmaxdata.compareidx,
        messageId: id,
        newData: [],
        number: -1,
      };
      if (session.findmaxdata.data[1] > session.findmaxdata.data[0]) {
        session.findmaxdata.maxidx = 1;
      }
      return [findmaxprops1, session];
    }

    if (session.findmaxdata.compare_start) {
      if (getSteps(message, "Second")) {
        session.findmaxdata.compareidx = 2;
        const findmaxprops2: Props = {
          type: "findmax",
          data: session.findmaxdata.data,
          maxidx: session.findmaxdata.maxidx,
          compareidx: session.findmaxdata.compareidx,
          messageId: id,
          newData: [],
          number: -1,
        };
        if (
          session.findmaxdata.data[2] >
          session.findmaxdata.data[session.findmaxdata.maxidx]
        ) {
          session.findmaxdata.maxidx = 2;
        }
        return [findmaxprops2, session];
      }
      if (getSteps(message, "Third")) {
        session.findmaxdata.compareidx = 3;
        const findmaxprops3: Props = {
          type: "findmax",
          data: session.findmaxdata.data,
          maxidx: session.findmaxdata.maxidx,
          compareidx: session.findmaxdata.compareidx,
          messageId: id,
          newData: [],
          number: -1,
        };
        if (
          session.findmaxdata.data[3] >
          session.findmaxdata.data[session.findmaxdata.maxidx]
        ) {
          session.findmaxdata.maxidx = 3;
        }
        return [findmaxprops3, session];
      }

      if (getSteps(message, "Fourth")) {
        session.findmaxdata.compareidx = 4;
        const findmaxprops4: Props = {
          type: "findmax",
          data: session.findmaxdata.data,
          maxidx: session.findmaxdata.maxidx,
          compareidx: session.findmaxdata.compareidx,
          messageId: id,
          newData: [],
          number: -1,
        };
        if (
          session.findmaxdata.data[4] >
          session.findmaxdata.data[session.findmaxdata.maxidx]
        ) {
          session.findmaxdata.maxidx = 4;
        }
        return [findmaxprops4, session];
      }
    }
  }

  // // ****************************Binary Search****************************
  if (session.mask.name == "Binary Search") {
    console.log("Binary Search");
    const animation_num = extractForBinary(message);
    if (animation_num === 0) {
      return [emptyprops, session];
    } else {
      const binaryprops: Props = {
        type: "binarysearch",
        number: animation_num,
        data: [2, 4, 6, 8, 10, 12],
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        newData: [],
      };
      return [binaryprops, session];
    }
  }

  // // ****************************Linear Search****************************
  if (
    session.mask.name == "Linear Search"
  ) {
    console.log("Linear Search");
    const contains5list = contains5ElementList(message);
    if (contains5list) {
      const _5list = extractArrayFromString(message);
      const _5list_s = Array.isArray(_5list) ? _5list : [];
      if (session.searchnumberdata.animationshowed === 0) {
        session.searchnumberdata.data = _5list_s;
      } else if (session.searchnumberdata.animationshowed === 1) {
        if (!_5list_s.includes(5)) {
          session.searchnumberdata.data = _5list_s;
          session.searchnumberdata.animationshowed = 2;
        }
      }
    }
    let searchnumberprops: Props = {
      type: "searchnumber",
      data: session.searchnumberdata.data,
      number: 5,
      messageId: id,
      maxidx: -1,
      compareidx: -1,
      newData: [],
    };
    if (
      session.searchnumberdata.animationshowed === 0 &&
      contains5list &&
      session.searchnumberdata.data.length === 5
    ) {
      session.searchnumberdata.animationshowed = 1;
      return [searchnumberprops, session];
    } else if (
      session.searchnumberdata.animationshowed === 2 &&
      session.searchnumberdata.data.length === 5
    ) {
      session.searchnumberdata.animationshowed = 3;
      return [searchnumberprops, session];
    } else {
      return [emptyprops, session];
    }
  }
// ***************************************************Connected Components***********************************************
  if (session.mask.name == "Identifying Connected Components in an Undirected Graph") {
    const { extracted, remaining } = extractJSONContent_original(message);
    const extracted_json = JSON.parse(extracted as string) as graphType;
      let graphprops: Props = {
        type: "component",
        number: -1,
        data: [],
        messageId: id,
        maxidx: -1,
        compareidx: -1,
        newData: [],
        json: extracted_json as graphType,
      };
      if (extracted === null){
        graphprops = emptyprops;  
      }
      return [graphprops, session];
  }
  // ***************************************************Check Connectivity***********************************************
  if (session.mask.name == "Graph Connectivity Problem") {
      const { extracted, remaining } = extractJSONContent_original(message);
      const extracted_json = JSON.parse(extracted as string) as graphType;
      
      let graphprops: Props = {
      type: "check connectivity",
      number: -1,
      data: [],
      messageId: id,
      maxidx: -1,
      compareidx: -1,
      newData: [],
      json: extracted_json as graphType,
      };

      if (extracted === null){
        graphprops = emptyprops;  
      }

      return [graphprops, session];
  }
    // ***************************************************Check Cycle***********************************************
  if (session.mask.name == "Detecting Cycles in a Directed Graph") {
      const { extracted, remaining } = extractJSONContent_original(message);
      const extracted_json = JSON.parse(extracted as string) as graphType;
      
      let graphprops: Props = {
      type: "check_cycle",
      number: -1,
      data: [],
      messageId: id,
      maxidx: -1,
      compareidx: -1,
      newData: [],
      json: extracted_json as graphType,
      };

      if (extracted === null){
        graphprops = emptyprops;  
      }
      return [graphprops, session];
    }

  return [emptyprops, session];
  
}
