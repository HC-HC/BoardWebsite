/*
  Name: Hannah Chen
  CS 132 Spring 2022
  Date: May 12, 2022
  This is the board.js page for Are you board?, a website that recommends
  activities for people who are bored. board.js is shared across the menu, 
  list, choose, and trivia view of the website. This file supports client-side 
  interactivity for handling user events including clicks and checkbox selection.
  It also includes a number of named functions to perform tasks such as 
  toggling between views and handling errors with the Bored API.
*/

"use strict";
(function () {
  const BORED_BASE_URL = "https://www.boredapi.com/api/activity?";
  const TRIVIA_URL = "https://jservice.io/api/random";
  const ACCESSIBILITY_MESSAGE = "On an accessibility scale of 1-10, we rate this activity a ";
  const DEFAULT_ACTIVITY_MESSAGE = "Here's an activity for you: ";
  const LIKE_AND_ADD_ID = "like-and-add";
  let activity = "";
  let answer = "";

  /**
     * adds the event listeners for the various buttons to enable
     * toggling between views, adding activities to the list, and going back 
     * to the home page, among others
  */
  function init() {
    id("start-choose-btn").addEventListener("click", toggleChoose);
    id("submit-btn").addEventListener("click", submit);
    id("back-from-choose-btn").addEventListener("click", backHome);
    id("back-btn").addEventListener("click", backHome);
    id("back-from-trivia-btn").addEventListener("click", backHome);
    id("number-pple").addEventListener("change", setNumberOfPeople);
    id("add-btn").addEventListener("click", addToList);
    id("see-list-btn").addEventListener("click", toggleListView);
    id("trivia-btn").addEventListener("click", toggleTriviaView);
    id("submit-guess").addEventListener("click", function (e) {
      submitGuess();
      e.preventDefault();
    });
    id("submit-guess").addEventListener("keypress", function (e) {
      if (e.key == "Enter") {
        submitGuess();
        e.preventDefault();
      }
    });
    id("next-question-btn").addEventListener("click", nextQuestion);
  }

  /**
   * Makes the fetch call to the Bored API.
   * Upon success, shows on the page the activity, a description, and 
   * an option to add the activity to a list.
   * If an error occurs, displays an appropriate message on the page.
   */
  function fetchBored() {
    let typeParameter = getType();
    let type = getType().split("=")[1];
    let url = BORED_BASE_URL + typeParameter + "&" + getPrice() + "&";
    url += ((type == "education" || type =="diy") ? "participants=1" : getNumPeople());
    fetch(url)
      .then(checkStatus)          
      .then(resp => resp.json())   
      .then(processBoredData)       
      .catch(handleError);         
  }

  /**
   * Makes the fetch call to the Bored API.
   * Upon success, shows on the page the activity, a description, and 
   * an option to add the activity to a list.
   * If an error occurs, displays an appropriate message on the page.
   */
   function fetchTrivia() {
    fetch(TRIVIA_URL)
      .then(checkStatus)          
      .then(resp => resp.json())   
      .then(processTriviaData)       
      .catch(handleError);         
  }

  /**
   * Processes the response to display bored API information on the page
   * with text content and the add to list button. 
   * @param {Object} boredJson - the parsed JSON object that was returned 
   * from the request.
   */
  function processBoredData(boredJson){
    activity = boredJson.activity;
    id("activity").textContent = DEFAULT_ACTIVITY_MESSAGE + activity;

    let listItem1 = gen("li");
    listItem1.textContent = "type: " + boredJson.type;
    id("activity-info-list").appendChild(listItem1);

    let listItem2 = gen("li");
    listItem2.textContent = ACCESSIBILITY_MESSAGE + 
      (boredJson.accessibility * 10).toString();
    id("activity-info-list").appendChild(listItem2);
  }

  /**
   * Processes the response to display trivia API information on the page
   * with text content and the add to list button. 
   * @param {Object} triviaJson - the parsed JSON object that was returned 
   * from the request.
   */
   function processTriviaData(triviaJson){
    answer = triviaJson[0].answer;
    let h1 = gen("h4");
    h1.textContent = "Category: " + triviaJson[0].category["title"];
    let h2 = gen("h4");
    h2.textContent = "Question: " + triviaJson[0].question;
    id("question-bank").append(h1);
    id("question-bank").append(h2);
  }

  /**
   * Handles the case when an error occurs in the fetch call chain, such as 
   * when the Bored API is down or when the request returns a non-200 error 
   * code. The function displays a user-friendly error message on the page.
   */
  function handleError() {
    // ajax call failed!
    id(LIKE_AND_ADD_ID).classList.toggle("hidden");
    id("activity").textContent = "There was an error requesting data from the \
    API service. Please try again."
  }

  /**
   * Adds an activity to the list of saved activities, and disables the add 
   * button to prevent the user from adding the same item twice.
   */
  function addToList() {
    id("saved-activities").appendChild(createResultItem(activity));
    id("add-btn").disabled = true;
  }

  /**
   * Toggles between the #menu-view and the #choose-view.
  */
  function toggleChoose() {
    ["menu-view", "choose-view"].map((view) => {
      id(view).classList.toggle("hidden");
    });
    id("activity").innerHTML = "";
    id("activity-info-list").innerHTML = "";
  }

  /**
   * Toggles between the #menu-view and the #list-view.
  */
  function toggleListView() {
    ["menu-view", "list-view"].map((view) => {
      id(view).classList.toggle("hidden");
    });
  }

  /**
   * Toggles between the #menu-view and the #trivia-view.
  */
   function toggleTriviaView() {
    ["menu-view", "trivia-view"].map((view) => {
      id(view).classList.toggle("hidden");
    });
    fetchTrivia();
    id("question-bank").innerHTML = "";
    id("submit-guess").disabled = false;
  }

  /**
   * Displays the next trivia question
  */
  function nextQuestion() {
    id("question-bank").innerHTML = "";
    fetchTrivia();
    clearInput();
    id("submit-guess").disabled = false;
  }

  /**
   * Supports the button that allows the user to go back to the #menu-view
  */
  function backHome() {
    ["choose-view", "list-view", "trivia-view"].map((view) => {
      id(view).classList.add("hidden");
    });
    id("menu-view").classList.toggle("hidden")
  }

  /**
   * unhides the text that asks if the user likes the activity and shows 
   * the button to add the activity to the list
  */
  function unhideLike() {
    if (id(LIKE_AND_ADD_ID).classList.contains("hidden")) {
      id(LIKE_AND_ADD_ID).classList.toggle("hidden");
    }
  }

  /**
   * gets the number of people as displayed on the range 
   * slider and updates the value displayed next to the range slider
  */
   function setNumberOfPeople() {
    let val = id("number-pple").value;
    id("number-pple-text").textContent =
      val.toString() + (val == 1 ? " person" : " people");
  }

  /**
   * Creates a list item depending on the correctness of the
   * answer the user provides. The list item will be added to the ordered 
   * list of results.
   * @param {string} activity - the chosen activity
   * @returns {Node} - the list item whose textContent is the activity
  */
  function createResultItem(activity) {
    const listItem = gen("li");
    listItem.textContent = activity;
    return listItem;
  }

  /**
   * submits the user's preferences by calling the fetchBored function, clearing
   * the previous activity info, enabling the add button, and unhiding the add
   * button
  */
  function submit() {
    fetchBored();
    id("activity-info-list").innerHTML = "";
    id("add-btn").disabled = false;
    unhideLike();
  }
  
  /**
   * selects a random type of activity out of the activities that are checked
   * and creates the optional parameter to specify the type of activity
   * @returns {string} the optional parameter to request a specific type of 
   * activity from the API
  */
  function getType() {
    let checkboxes = qsa('input[name="type"]:checked');
    let selectedType = checkboxes[Math.floor(Math.random()*checkboxes.length)].value;
    return "type=" + selectedType;
  }

  /**
   * gets the radio button that is checked and creates the optional parameter 
   * to specify whether or not the activity is free
   * @returns {string} the optional parameter to request an activity of a 
   * specific price from the API
  */
  function getPrice() {
    let isFree = qs('input[name="price"]:checked').value == "free";
    if (isFree) {
      return "price=0.0";
    } else {
      return "minprice=0.05"
    }
  }

  /**
   * gets the number of questions as on the range slider and creates the 
   * optional parameter to specify the number of participants
   * @returns {string} the optional parameter to request an activity that 
   * requires a specific number of participants from the API
  */
  function getNumPeople() {
    let val = id("number-pple").value;
    return "participants=" + val;
  }

  /**
   * allows the user to submit a guess, checks the correctness of the guess, 
   * and displays the correct answer if it is incorrect
  */
   function submitGuess() {
    let result = gen("h4");
    result.textContent = (checkGuess() ? "Correct! " + String.fromCodePoint(128513)
    : "Not quite. The correct answer is " + answer);
    id("question-bank").appendChild(result);
    id("submit-guess").disabled = true;
  }

  /**
   * gets the user's guess and checks it based off of the answer key
   * @returns {boolean} - whether the guess is correct or not
  */
   function checkGuess() {
    let guess = id("guess").value.toString().toLowerCase();
    return answer.toLowerCase() == guess;
  }

  /**
   * clearInput() clears the text input after a guess has been submitted.
  */
   function clearInput() {
    id("guess-form").reset();
  }

  init();
})();
