/**
* 7 neurons for the input layer. They would represent the last 7 characters of the name.
* 6 neurons for the hidden layer
* 2 neurons for the output layer (one for male, one for female)
*/
var INPUT_LENGTH = 7;
var myNetwork = new synaptic.Architect.Perceptron(INPUT_LENGTH, 6, 2);
var trainingData = [];
var trainer = new synaptic.Trainer(myNetwork);

/**
 * A function that can convert a name to a format that the neural network understands:
* it can only take floating point numbers between 0 and 1. So, I decided to convert each 
* of the last 7 characters in the name to their character codes, and divide them by 1000.
* If a name was too short, it is padded with spaces.
*/
function convertNameToInput(name) {
    name = name.toLowerCase();
    if(name.length > INPUT_LENGTH)
        name = name.substring(INPUT_LENGTH);
 
    while(name.length < INPUT_LENGTH)
        name = " " + name;
 
    var characters = name.split("");
    return characters.map(
       (c) => c == " " ? 0 : c.charCodeAt(0)/1000
    );
 }

 /**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

 /**
  * Accept a name as input and tell the gender
  */
 function getGender(name) {
    var result = myNetwork.activate(convertNameToInput(name));
    if(result[0] > result[1])
       return "Male (" + (result[0]*100).toFixed() + "% sure)";
    return "Female (" + (result[1]*100).toFixed() + "% sure)";
}

/**
 * Once I had the names in two JavaScript arrays, I had to convert them to a format that Synaptic’s Trainer understands.
* It’s a simple format. You simply specify the values of the input neurons, and the values of the output neurons.
* Two for loops did the job.
*/
for(var i = 0; i < females.length; i++) {
    trainingData.push({
        input: convertNameToInput(females[i]),
        output: [0, 1] // Male = false, Female = true
    });
}

for(var i = 0; i < males.length; i++) {
    for(var j = 0; j < 2; j++) {
        trainingData.push({
            input: convertNameToInput(males[i]),
            output: [1, 0] // Male = true, Female = false
        });
    }
}

// Training data is said to be good only if it has been shuffled well
for(var i=0;i<10;i++)
    trainingData = shuffle(trainingData);

/**
 * All that was left to do was run the actual training.
* I ran a total of 5000 iterations: 25 batches of 200 iterations each. 
* For the learning rate I experimented with various values, and found that 0.01 was optimal. 
* As for the cost function, I tried both CROSS_ENTROPY and MSE, and found that MSE was better.
*/
for(var i = 0 ; i < 25 ; i++) {           
    trainer.train(trainingData, {
        rate: 0.01,
        iterations: 200,
        shuffle: true,
        cost: synaptic.Trainer.cost.MSE
    });
    var error = trainer.test(trainingData)["error"];
    console.log(
       "Iteration " + ((i+1) * 200) + " --> Error: " + error
    );
}

/**
 * Finally, test it with a few random names.
 */
for(var i = 0; i < test_names.length; i++) {
    console.log("Gender of " + test_names[i] + " -> " + getGender(test_names[i]))
}