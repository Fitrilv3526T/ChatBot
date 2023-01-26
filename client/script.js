import bot from "./assets/bot.svg"
import user from "./assets/user.svg"

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// loader will run when the robo thinks means the (...) will appear when this function runs

const loader = (element) => {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300)
}


// robo will type only one letter in 20ms when function typeText runs

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// this function will generate a random unique id 

const generateUniqueId = () => {
  const timeStamp = Date.now();
  const randomNum = Math.random();
  const hexaDecimalString = randomNum.toString(16);

  return `id-${timeStamp}-${hexaDecimalString}`
}


// this will differniate between a user question and a robo answer

const chatStripe = (isAI, value, uniqueId) => {
  return (
    `
    <div  class="wrapper ${isAI && 'ai'}">
      <div class ="chat">
        <div class = "profile">
          <img
            src= "${isAI ? bot : user}"
            alt ="${isAI ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>
        ${value}
        </div>
      </div>
    </div>
    `
  )
}


const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);


  // user chatStripe {means user question}

  chatContainer.innerHTML += chatStripe(false,data.get('prompt'))
  form.reset();

  // robo chatStripe {means robo answer}

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);


  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server => robo response

  const response = await fetch('http://localhost:5000',{
    method :'POST',
    headers: {
      "Content-type": "application/json"
    },
    body:JSON.stringify({
      prompt:data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();
    
    typeText(messageDiv,parsedData)
  }else{
    const err = await response.text();

    messageDiv.innerHTML = "Somthing Went Wrong";

    alert(err)
  }

}

form.addEventListener('submit', handleSubmit)

form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})