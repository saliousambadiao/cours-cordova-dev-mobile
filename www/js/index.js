// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the form elements
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Disable the calculate button initially
    calculateBtn.disabled = true;
    
    // Add event listener to the calculate button
    calculateBtn.addEventListener('click', CalculateIMC);
    
    // Add input event listeners to validate input fields
    weightInput.addEventListener('input', validateInputs);
    heightInput.addEventListener('input', validateInputs);
    
    // Function to validate inputs and enable/disable the calculate button
    function validateInputs() {
        const weightValue = weightInput.value.trim();
        const heightValue = heightInput.value.trim();
        
        // Check if both fields have values and are valid numbers greater than 0
        const isWeightValid = weightValue !== '' && !isNaN(weightValue) && parseFloat(weightValue) > 0;
        const isHeightValid = heightValue !== '' && !isNaN(heightValue) && parseFloat(heightValue) > 0;
        
        // Enable the button only if both inputs are valid
        calculateBtn.disabled = !(isWeightValid && isHeightValid);
    }
});

function CalculateIMC() {
    const weight = document.getElementById('weight');
    const height = document.getElementById('height');
    
    // Double check validation before calculation
    if (weight.value.trim() === '' || height.value.trim() === '' || 
        isNaN(weight.value) || isNaN(height.value) ||
        parseFloat(weight.value) <= 0 || parseFloat(height.value) <= 0) {
        // Show error message in the result box
        const resultBox = document.getElementById('resultBox');
        resultBox.innerHTML = "Please enter valid weight and height values";
        resultBox.className = "error";
        return;
    }

    const imc = parseFloat(weight.value) / Math.pow(parseFloat(height.value), 2);
    let interpretation = "You are in a state of ";
    let healthClass = "";

    if (imc < 16.5) {
        interpretation += "severe underweight";
        healthClass = "severe-underweight";
    }
    else if (imc >= 16.5 && imc < 18.5) {
        interpretation += "underweight";
        healthClass = "underweight";
    }
    else if (imc >= 18.5 && imc < 25) {
        interpretation = "You have a normal weight";
        healthClass = "normal-weight";
    }
    else if (imc >= 25 && imc < 30) {
        interpretation += "overweight";
        healthClass = "overweight";
    }
    else if (imc >= 30 && imc < 35) {
        interpretation += "moderate obesity";
        healthClass = "moderate-obesity";
    }
    else if (imc >= 35 && imc < 40) {
        interpretation += "severe obesity";
        healthClass = "severe-obesity";
    }
    else {
        interpretation += "morbid or massive obesity";
        healthClass = "morbid-obesity";
    }

    const resultBox = document.getElementById('resultBox');
    
    // Supprimer toutes les classes de santé précédentes
    resultBox.classList.remove(
        "severe-underweight", 
        "underweight", 
        "normal-weight", 
        "overweight", 
        "moderate-obesity", 
        "severe-obesity", 
        "morbid-obesity", 
        "error"
    );
    
    // Ajouter la nouvelle classe de santé
    resultBox.classList.add(healthClass);
    
    resultBox.innerHTML = `Your BMI is ${imc.toFixed(2)} <hr> ${interpretation}`;
}