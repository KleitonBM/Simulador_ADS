let allQuestions = [];
let selectedQuestions = [];
let currentQuestion = 0;
let score = 0;
let answers = [];
let essayQuestion = null;
// Obtém a matéria selecionada da URL
const urlParams = new URLSearchParams(window.location.search);
const materia = urlParams.get('materia');
const OPENAI_API_KEY = "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"; // Substitua pela sua chave da OpenAI

async function avaliarRespostaDissertativa(resposta) {
    const prompt = `Avalie a seguinte resposta para a questão: "${essayQuestion}". 
    Dê um feedback objetivo e uma nota de 0 a 10.  
    Resposta do aluno: "${resposta}"`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4", // Pode ser "gpt-3.5-turbo"
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Erro ao avaliar resposta:", error);
        return "Houve um problema ao avaliar sua resposta. Tente novamente mais tarde.";
    }
}


// Chamar a função ao finalizar a prova
async function finalizarProva() {
    const respostaAluno = document.getElementById("resposta-dissertativa").value;
    
    if (respostaAluno.trim() != "") {
        
    document.getElementById("loading").style.display = "block"; // Mostrar um carregamento

    const feedbackIA = await avaliarRespostaDissertativa(respostaAluno);

    document.getElementById("feedback-ia").innerText = feedbackIA;
    document.getElementById("loading").style.display = "none"; // Esconder o carregamento
}
}

async function loadQuestions() {
    const questionsFile = `./Materias/${materia}/perguntas.json`; // Carrega o JSON da matéria selecionada

    try {
        const response = await fetch(questionsFile);
        allQuestions = await response.json();
        await loadEssayQuestion();
        startQuiz();
    } catch (error) {
        console.error("Erro ao carregar perguntas:", error);
    }
}

async function loadEssayQuestion() {
    try {
        const response = await fetch(`./Materias/${materia}/temas.json`);
        const themes = await response.json();
        essayQuestion = themes[Math.floor(Math.random() * themes.length)];
    } catch (error) {
        console.error("Erro ao carregar temas dissertativos:", error);
    }
}

function goHome() {
    window.location.href = "./index.html";
}

function startQuiz() {
    document.getElementById("dissertative-container").classList.add("hidden");
    document.getElementById("bt_restart").classList.add("hidden");
    selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

    // Embaralha as respostas apenas no início
    selectedQuestions.forEach(question => {
        question.options = shuffleArray(question.options);
    });

    currentQuestion = 0;
    score = 0;
    answers = new Array(selectedQuestions.length + 1).fill(null); // +1 para a dissertativa
    generateNavigation();
    loadQuestion();
}

function generateNavigation() {
    let nav = document.getElementById("question-nav");
    nav.innerHTML = "";
    selectedQuestions.forEach((_, index) => {
        let btn = document.createElement("button");
        btn.textContent = index + 1;
        btn.id = `nav-${index}`;
        btn.onclick = () => loadQuestion(index);
        nav.appendChild(btn);
    });

    // Adiciona botão para questão dissertativa
    let essayBtn = document.createElement("button");
    essayBtn.textContent = "Dissertativa";
    essayBtn.id = "nav-essay";
    essayBtn.classList.add("dissertative-btn");
    essayBtn.onclick = () => loadEssayQuestionUI();
    nav.appendChild(essayBtn);

    let Respostas_Buton = document.createElement("button");
    Respostas_Buton.textContent = "Resposta";
    Respostas_Buton.id = "nav-Resposta";
    Respostas_Buton.classList.add("dissertative-btn");
    Respostas_Buton.classList.add("hidden");
    Respostas_Buton.onclick = () => loadRespostaQuestionUI();
    nav.appendChild(Respostas_Buton);

}



function loadRespostaQuestionUI(){
    currentQuestion = selectedQuestions.length+1; // Define índice da questão dissertativa
    document.getElementById("question").textContent = essayQuestion;
    document.getElementById("result-container").classList.remove("hidden");
    document.getElementById("quiz-container").classList.add("hidden");
    updateNavigation();
}

function loadEssayQuestionUI() {
    currentQuestion = selectedQuestions.length; // Define índice da questão dissertativa
    document.getElementById("question").innerHTML = essayQuestion.question;
    document.getElementById("Correta_dado").innerHTML = essayQuestion.Resposta;
    document.getElementById("options").classList.add("hidden");
    document.getElementById("Img_t").classList.add("hidden");
    document.getElementById("dissertative-container").classList.remove("hidden");
    document.getElementById("result-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("Correta_dado").classList.remove("correct");
    document.getElementById("Correta_dado").classList.remove("wrong");
    updateNavigation();
}


function loadQuestion(index = 0) {
    currentQuestion = index;
    let q = selectedQuestions[currentQuestion];
    let Res = document.getElementById(`nav-${currentQuestion}`);
    if (Res.classList.contains("answered")){
        document.getElementById("Correta_dado").classList.remove("hidden");

         if (answers[currentQuestion].selected === q.Resposta) {
            document.getElementById("Correta_dado").innerHTML = `Resposta Correta: ${q.Resposta}`
            document.getElementById("Correta_dado").classList.remove("wrong")
            document.getElementById("Correta_dado").classList.add("correct")
        }else{
            document.getElementById("Correta_dado").innerHTML = `Escolha Incorreta<br>Resposta Correta: ${q.Resposta}`
            document.getElementById("Correta_dado").classList.remove("correct")
            document.getElementById("Correta_dado").classList.add("wrong")
        };
    }else{
        document.getElementById("Correta_dado").innerHTML = '';
    };
    
    document.getElementById("question").textContent = q.question;
    document.getElementById("question").innerHTML = q.question.replace(/\n/g, "<br>");
    document.getElementById("dissertative-container").classList.add("hidden");
    document.getElementById("options").classList.remove("hidden");
    document.getElementById("result-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");

    // Exibe a imagem da pergunta, se houver
    let questionImage = document.getElementById("question-image");
    if (q.imagem) {
        questionImage.src = q.imagem;
        questionImage.style.display = "block";
    } else {
        questionImage.style.display = "none";
    }

    let optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    
    q.options.forEach(option => {
        let btn = document.createElement("button");
        btn.innerHTML = option.text;
        btn.onclick = () => checkAnswer(option.text, btn);
        
        if (answers[currentQuestion] && answers[currentQuestion].selected === option.text) {
            btn.classList.add("selected");
        }

        optionsDiv.appendChild(btn);
    });

    updateNavigation();
}


function checkAnswer(option, btn) {
    let isCorrect = option === selectedQuestions[currentQuestion].Resposta;
    answers[currentQuestion] = { question: selectedQuestions[currentQuestion].question, selected: option, correct: isCorrect, correctAnswer: selectedQuestions[currentQuestion].Resposta };
    
    if (isCorrect) {
        score++
        document.getElementById("Correta_dado").innerHTML = `Resposta Correta: ${selectedQuestions[currentQuestion].Resposta}`
        document.getElementById("Correta_dado").classList.remove("wrong")
        document.getElementById("Correta_dado").classList.add("correct")
        
    }else{
       
        document.getElementById("Correta_dado").innerHTML = `Escolha Incorreta<br>Resposta Correta: ${selectedQuestions[currentQuestion].Resposta}`
        document.getElementById("Correta_dado").classList.remove("correct")
        document.getElementById("Correta_dado").classList.add("wrong")
        score--
    };
    document.getElementById(`nav-${currentQuestion}`).classList.add("answered");
    
    document.querySelectorAll("#options button").forEach(button => button.classList.remove("selected"));
    btn.classList.add("selected");

    if (answers.filter(a => a !== null).length === selectedQuestions.length + 1) {
        showResults();
    }
}

function showResults() {
    let list = document.getElementById("answers-list");
    list.innerHTML = "";
    
    answers.forEach((a, index) => {
        if (!a) {
            answers[index] = { ...selectedQuestions[index], selected: "Não respondida", correct: false, correctAnswer: selectedQuestions[index]?.Resposta };
        }
    });

    answers.forEach((a, index) => {
        if (index<10) {
            let item = document.createElement("h6");
            item.innerHTML = `${index + 1} - ${a.question}<br><br>Sua resposta: <span class='${a.correct ? "correct" : "wrong"}'>${a.selected}</span>`;
            
            if (!a.correct) {
                item.innerHTML += ` <br> Resposta correta: <span class='correct'>${a.correctAnswer}</span>`;
            }
            if (index<9) {
                item.innerHTML += `<br><br>-------------------------------------------------------------------------------------------------------------------<br><br>`
            }
            
            item.style.cursor = "pointer";
            item.onclick = () => loadQuestion(index);
            list.appendChild(item);
    }
    });
    
    document.getElementById("score").textContent = `Sua nota: ${score} de ${selectedQuestions.length}`;
    document.getElementById("bt_start").classList.add("hidden");
    document.getElementById("bt_restart").classList.remove("hidden");
    document.getElementById("nav-Resposta").classList.remove("hidden");
    loadRespostaQuestionUI();
    //document.getElementById("quiz-container").classList.add("hidden");
    //document.getElementById("result-container").classList.remove("hidden");
}

function restartQuiz() {
    document.getElementById("dissertative-container").classList.add("hidden");
    document.getElementById("result-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("bt_start").classList.remove("hidden");
    startQuiz();
}

function updateNavigation() {
    document.querySelectorAll("#question-nav button").forEach((btn, index) => {
        btn.classList.toggle("active", index === currentQuestion);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.onload = loadQuestions();
