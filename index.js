import { Combination } from 'https://cdn.jsdelivr.net/npm/js-combinatorics@1.4.5/combinatorics.min.js';
import * as Colors from 'https://deno.land/std/fmt/colors.ts';

let telephoneLinesNumber = 1;
const telephoneLines = [[]];

const compareArrays = (array1, array2) => {
  // if the other array is a falsy value, return
  if (!array2) return false;

  // compare lengths - can save a lot of time
  if (array1.length !== array2.length) return false;

  for (let i = 0, l = array1.length; i < l; i += 1) {
    // Check if we have nested arrays
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!compareArrays(array1[i], array2[i])) return false;
    } else if (array1[i] !== array2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};

const getSingleModeTelephoneNumber = async (
  graphToArray,
  existingCombinations = [],
  concurrentSpeakers = 2,
  richOutput = true,
) => {
  const indent = '    '.repeat(existingCombinations.length);
  if (richOutput) {
    console.log(`${indent}`);
    console.log(`${indent}Working with graph: ${Colors.blue(JSON.stringify(graphToArray))}`);
    console.log(`${indent}Graph order: ${Colors.green(graphToArray.length.toString())}`);
    console.log(`${indent}Pre-existing connections: ${JSON.stringify(existingCombinations)}`);
  }

  // If graph is 1 or 0, no new connections can be made
  if (graphToArray.length < concurrentSpeakers) {
    if (richOutput) {
      const prevGraph = existingCombinations.length
        ? [...graphToArray, ...existingCombinations[existingCombinations.length - 1]].sort()
        : null;
      console.log(
        `${indent}${Colors.red('Near-null graph')}, returning${
          existingCombinations.length ? ` to ${Colors.blue(JSON.stringify(prevGraph))}` : '...'
        }`,
      );
    }
    return;
  }

  const combinations = new Combination(graphToArray, concurrentSpeakers);
  for (let j = 0; j < combinations.length; j += 1) {
    // Convert combination to universal array format
    const arrayifiedCombination = Array.from(combinations.nth(j));
    const connectionsLayout = [...existingCombinations, arrayifiedCombination].sort();

    // Check if current connections layout is already counted, if not, add it
    let isRepeated = false;
    telephoneLines.forEach((countedConnectionsLayout) => {
      if (compareArrays(countedConnectionsLayout, connectionsLayout)) {
        isRepeated = true;
      }
    });
    if (!isRepeated) {
      telephoneLinesNumber += 1;
      telephoneLines.push(connectionsLayout);
    }

    if (richOutput) {
      console.log(`${indent}`);
      console.log(`${indent}Combination: ${Colors.brightYellow(arrayifiedCombination.toString())}`);
    }
    // Remove combination from graph and recursively call again
    const graphWithoutCombination = graphToArray.filter(
      (node) => !arrayifiedCombination.includes(node),
    );
    getSingleModeTelephoneNumber(
      graphWithoutCombination,
      [...existingCombinations, arrayifiedCombination],
      concurrentSpeakers,
      richOutput,
    );
  }
  if (richOutput) {
    console.log(`${indent}`);
    console.log(
      `${indent}Explored all possibilities with ${Colors.green(JSON.stringify(graphToArray))}`,
    );
  }
  if (!existingCombinations.length) {
    console.log(telephoneLinesNumber);
    // await fs.writeFile(
    //   `./exports/conferenceNumbers${graphToArray.length}only${concurrentSpeakers}.json`,
    //   `${JSON.stringify({ telephoneLines, telephoneLinesNumber })}`,
    //   (err) => {
    //     if (err) throw err;
    //     console.log('Saved!');
    //   },
    // );
  }
};

const getMultiModeTelephoneNumber = async (
  graphToArray,
  existingCombinations = [],
  maxConcurrentSpeakers = 2,
  richOutput = true,
) => {
  const indent = '    '.repeat(existingCombinations.length);
  if (richOutput) {
    console.log(`${indent}`);
    console.log(`${indent}Working with graph: ${Colors.blue(JSON.stringify(graphToArray))}`);
    console.log(`${indent}Graph order: ${Colors.green(graphToArray.length.toString())}`);
    console.log(`${indent}Pre-existing connections: ${JSON.stringify(existingCombinations)}`);
  }

  for (let i = 2; i <= maxConcurrentSpeakers; i += 1) {
    // Checking if graph is too short for current max conference number
    if (graphToArray.length < i) {
      // If there's some existing combination, we say returning to prev graph
      // If we are at root graph we just say returning...
      if (richOutput) {
        const prevGraph = existingCombinations.length
          ? [...graphToArray, ...existingCombinations[existingCombinations.length - 1]].sort()
          : null;
        console.log(
          `${indent}Too short for combinations of ${Colors.red(i.toString())}, returning${
            existingCombinations.length ? ` to ${Colors.blue(JSON.stringify(prevGraph))}` : '...'
          }`,
        );
      }
      break;
    }

    const combinations = new Combination(graphToArray, i);
    for (let j = 0; j < combinations.length; j += 1) {
      const combination = combinations.nth(j);
      // Convert combination to universal array format
      const arrayifiedCombination = Array.from(combination);
      const connectionsLayout = [...existingCombinations, arrayifiedCombination].sort();

      // Check if current connections layout is already counted, if not, add it
      let isRepeated = false;
      telephoneLines.forEach((countedConnectionsLayout) => {
        if (compareArrays(countedConnectionsLayout, connectionsLayout)) {
          isRepeated = true;
        }
      });
      if (!isRepeated) {
        telephoneLinesNumber += 1;
        telephoneLines.push(connectionsLayout);
      }

      // Writing of combination
      if (richOutput) {
        console.log(`${indent}`);
        console.log(
          `${indent}Combination: ${Colors.brightYellow(arrayifiedCombination.toString())}`,
        );
      }

      // Remove combination from graph and recursively call again
      const graphWithoutCombination = graphToArray.filter(
        (node) => !arrayifiedCombination.includes(node),
      );
      getMultiModeTelephoneNumber(
        graphWithoutCombination,
        [...existingCombinations, arrayifiedCombination],
        maxConcurrentSpeakers,
        richOutput,
      );
    }
  }

  if (richOutput) {
    console.log(`${indent}`);
    console.log(
      `${indent}Explored all possibilities with ${Colors.green(JSON.stringify(graphToArray))}`,
    );
  }
  if (!existingCombinations.length) {
    console.log(telephoneLinesNumber);
    await Deno.writeTextFile(
      `./exports/conferenceNumbers${graphToArray.length}max${maxConcurrentSpeakers}.json`,
      `${JSON.stringify({ telephoneLines, telephoneLinesNumber })}`,
    );
    console.log('Saved');
  }
};

// getSingleModeTelephoneNumber([1, 2, 3, 4], [], 2);
getMultiModeTelephoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9], [], 3, false);
