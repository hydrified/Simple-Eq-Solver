let equation = document.getElementById("equation");
let result = document.getElementById("result");
let variable = document.querySelector("#variable");
let solveButton = document.getElementById("solve-button");



const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3
};

const isOperator = (char) => ['+', '-', '*', '/', '^'].includes(char);
const isOperand = (char) => /[A-Za-z0-9]/.test(char);
function infixToPostfix(expression) {
    const stack = [];
    let postfix = [];

    for (let char of expression) {
        if (isOperand(char)) {
            postfix.push(char);  // Add operands directly to the postfix expression
        } 
        else if (char === '(') {
            stack.push(char);  // Push '(' onto the stack
        } 
        else if (char === ')') {
            // Pop from the stack until '(' is encountered
            while (stack.length && stack[stack.length - 1] !== '(') {
                postfix.push(stack.pop());
            }
            stack.pop();  // Remove the '(' from the stack
        } 
        else if (isOperator(char)) {
            // Pop operators with higher or equal precedence
            while (
                stack.length &&
                isOperator(stack[stack.length - 1]) &&
                precedence[char] <= precedence[stack[stack.length - 1]]
            ) {
                postfix.push(stack.pop());  // Add to postfix expression if higher precedence or same precedence and left-to-rightstack.pop();
            }
            stack.push(char);  // Push the current operator onto the stack
        }
    }

    // Pop any remaining operators from the stack
    while (stack.length) {
        postfix.push(stack.pop());  // Add to postfix expressionstack.pop();
    }

    return postfix;
}



function divideTerms(term1, term2) {
    // Helper function to parse the coefficient and variable parts
    function parseTerm(term) {
        term=term.toString();
        const match = term.match(/^([-+]?\d*)([a-zA-Z][a-zA-Z0-9]*)?$/);
        if (!match) throw new Error(`Invalid term: ${term}`);
        const coefficient = match[1] === "" || match[1] === "+" ? 1 : match[1] === "-" ? -1 : parseFloat(match[1]);
        const variable = match[2] || ""; // If no variable, set to empty string
        return { coefficient, variable };
    }

    // Parse both terms
    const { coefficient: coeff1, variable: var1 } = parseTerm(term1);
    const { coefficient: coeff2, variable: var2 } = parseTerm(term2);

    // Check for division by zero
    if (coeff2 === 0){
        throw new Error("Division by zero is not allowed.");
    } 

    // Divide coefficients
    const coefficientResult = coeff1 / coeff2;

    // Simplify variables
    let variableResult = "";

    if (var1 === var2) {
        variableResult = ""; // Variables cancel out (e.g., x / x = 1)
    } else if (var1.startsWith(var2)) {
        variableResult = var1.slice(var2.length); // Partial cancellation (e.g., x^2 / x = x)
    } else if (var2.startsWith(var1)) {
        variableResult = "/" + var2.slice(var1.length); // Denominator variable remains (e.g., x / x^2 = 1/x)
    } else {
        variableResult = `${var1}/${var2}`; // No common variable (e.g., x / y)
    }

    // Combine results
    const result = `${coefficientResult}${variableResult}`.trim();

    return result || "1"; // Default to "1" if result is empty
}       

    

function evaluatePostfix(postfix) {
    let stack = [];
    for (let i = 0; i < postfix.length; i++) {
        let token = postfix[i];
        if (isOperator(token)) {
            let operand2 = stack.pop();
            let operand1 = stack.pop();
            let result = performOperation(token, operand1, operand2);
            if(typeof result === "object"){
                stack.push(result[0]);
                stack.push(result[1]);
            }else{
                stack.push(result);
            }
        } else {
            stack.push(token);
        }
    }
    return stack;
}
function getVariableFromTerm(term) {
    //term = term.toString();
    try{
        //let variableRegex = /[A-Za-z\/]+\d*[A-Za-z]*/
        return term.match(/[A-Za-z]+/)[0];
    }
    catch(error){
        return "";
    }
}
function getCoefficientFromTerm(term) {
    //term = term.toString()
    try{
        return term.match(/-?\d+/)[0];
    } catch (error) {
        return 1;
    }
    
}
function performOperation(operator, operand1, operand2) {
    let coefficient1 = getCoefficientFromTerm(operand1);
    let coefficient2 = getCoefficientFromTerm(operand2);

    let termVariable1 = getVariableFromTerm(operand1);
    let termVariable2 = getVariableFromTerm(operand2);
    switch (operator) {
        case "+":
            if(termVariable1 !== termVariable2) {
                return [operand1,operand2];
            }
            return `${Number(coefficient1) + Number(coefficient2)}${termVariable1}`;
        case "-":
            if(getVariableFromTerm(operand1) !== getVariableFromTerm(operand2)) {
                return [operand1,"-".concat(operand2)];
            }
            return `${Number(coefficient1) - Number(coefficient2)}${termVariable1}`;
        case "*":
            return `${Number(coefficient1) * Number(coefficient2)}${termVariable1}${termVariable2}`;
        case "/":        
            return divideTerms(operand1, operand2);
    }
}

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Combine like terms in a list of terms.
 * @param {string[]} terms The list of terms to combine.
 * @returns {string[]} The combined terms.
 */
/******  e2e82f46-0f03-4bdf-aefe-38e2f69f2178  *******/
function combineLikeTerms(terms) {
    let termDict = new Object();
    let variable = "";
    for (let i = 0; i < terms.length; i++) {
        variable = getVariableFromTerm(terms[i]);
        termDict[variable] = termDict[variable] ? termDict[variable] + " " + terms[i] : terms[i];
    }
    let result = [];
    for (let key in termDict) {
        result.push(termDict[key].split(" ").reduce((a, b) => performOperation("+", a, b)));
    }

    return result;
}

function solve() {
    let equationText = equation.value;
    let variableName = variable.value;
    //strips whitespace
    equationText = equationText.replace(/\s+/g, " ");
    //checks to see if the equation is valid
    let isValidRegex = /^[-+*/()0-9a-zA-Z\s]+=[-+*/()0-9a-zA-Z\s]+$/gm;
    if (!isValidRegex.test(equationText)) {
        alert("Invalid input. Please enter a valid equation.");
        return;
    } 
    //evaluates the equation and splits it into left and right sides
    leftEquationText = equationText.split("=")[0].match(/\d+[A-Za-z]*|[*\/+-]/g);
    rightEquationText = equationText.split("=")[1].match(/\d+[A-Za-z]*|[*\/+-]/g);
    let leftSidePostfix = infixToPostfix(leftEquationText);
    let rightSidePostfix = infixToPostfix(rightEquationText);


    let leftSideResult = evaluatePostfix(leftSidePostfix);
    let rightSideResult = evaluatePostfix(rightSidePostfix);

    console.log(leftSideResult);
    console.log(rightSideResult);
    // combines like terms
    let left = combineLikeTerms(leftSideResult);
    let right = combineLikeTerms(rightSideResult);

    //moves the variable we are solving for to the left side
    for (let i = 0; i < right.length; i++) {
        if (right[i].includes(variableName)) {
            left.push(performOperation("*", '-1', right[i]));
            right.splice(i, 1);
            i--;
        }
    }
    //moves everything else to the right side
    for (let i = 0; i < left.length; i++) {
        if (!(left[i].includes(variableName))) {
            right.push(performOperation("*", '-1', left[i]));
            left.splice(i, 1);
            i--;
        }
    }
    left = combineLikeTerms(left);
    right = combineLikeTerms(right);

    //solves for the variable
    let answer = performOperation("/", right.join(" "), getCoefficientFromTerm(left.join(" ")));
    answerText = `${equationText}\n${variableName} = ${answer}`;

    result.textContent = answerText;

}

solveButton.addEventListener("click", solve);