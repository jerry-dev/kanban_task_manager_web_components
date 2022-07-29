const isTextTooSimilar = (textOne, textTwo) => {
    //Removing all white space and joining the text together into one text string
    const textOneReformatted = textOne.replace(" " , "").toLowerCase().split("").filter((text) => { return text !== " " }).join("")
    const textTwoReformatted = textTwo.replace(" " , "").toLowerCase().split("").filter((text) => { return text !== " " }).join("")
    
    let result = false;

    if (textOneReformatted === textTwoReformatted) {
        result = true;
    }

    return result;
}

export default isTextTooSimilar;