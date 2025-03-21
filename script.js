let allQuestions = [];
        let selectedQuestions = [];
        let currentQuestion = 0;
        let score = 0;
        let answers = [];
        let essayQuestion = null;

        // Obtém a matéria selecionada da URL
        const urlParams = new URLSearchParams(window.location.search);
        const materia = urlParams.get('materia');

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
        }

        function loadQuestion(index = 0) {
            currentQuestion = index;
            let q = selectedQuestions[currentQuestion];
            
            document.getElementById("question").textContent = q.question;
            document.getElementById("question").innerHTML = q.question.replace(/\n/g, "<br>");
            document.getElementById("dissertative-container").classList.add("hidden");
            document.getElementById("options").classList.remove("hidden");

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
                btn.textContent = option.text;
                btn.onclick = () => checkAnswer(option.text, btn);
                
                if (answers[currentQuestion] && answers[currentQuestion].selected === option.text) {
                    btn.classList.add("selected");
                }

                optionsDiv.appendChild(btn);
            });

            updateNavigation();
        }

        function loadEssayQuestionUI() {
            currentQuestion = selectedQuestions.length; // Define índice da questão dissertativa
            document.getElementById("question").textContent = essayQuestion;
            document.getElementById("options").classList.add("hidden");
            document.getElementById("Img_t").classList.add("hidden");
            document.getElementById("dissertative-container").classList.remove("hidden");
            updateNavigation();
        }

        function checkAnswer(option, btn) {
            let isCorrect = option === selectedQuestions[currentQuestion].Resposta;
            answers[currentQuestion] = { question: selectedQuestions[currentQuestion].question, selected: option, correct: isCorrect, correctAnswer: selectedQuestions[currentQuestion].Resposta };
            if (isCorrect) score++;
            document.getElementById(`nav-${currentQuestion}`).classList.add("answered");
            
            document.querySelectorAll("#options button").forEach(button => button.classList.remove("selected"));
            btn.classList.add("selected");

            if (answers.filter(a => a !== null).length === selectedQuestions.length + 1) {
                showResults();
            }
        }

        function showResults() {
            document.getElementById("quiz-container").classList.add("hidden");
            document.getElementById("bt_start").classList.add("hidden");
            document.getElementById("result-container").classList.remove("hidden");
            document.getElementById("bt_restart").classList.remove("hidden");

            answers.forEach((a, index) => {
                if (!a) {
                    answers[index] = { ...selectedQuestions[index], selected: "Não respondida", correct: false, correctAnswer: selectedQuestions[index]?.Resposta };
                }
            });

            document.getElementById("score").textContent = `Sua nota: ${score} de ${selectedQuestions.length}`;
            let list = document.getElementById("answers-list");
            list.innerHTML = "";
            answers.forEach(a => {
                let item = document.createElement("li");
                item.textContent = `${a.question} - Sua resposta: ${a.selected} ${a.correct ? "✔" : `✘ (Resposta correta: ${a.correctAnswer})`}`;
                item.style.color = a.correct ? "green" : "red";
                list.appendChild(item);
            });
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