
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the dashboard
  initializeDashboard()

  // Set up event listeners
  setupEventListeners()

  // Initialize charts
  initializeCharts()

  // Initialize gauges
  initializeGauges()
})

// Initialize Dashboard
function initializeDashboard() {
  // Check for dark mode preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode")
    document.getElementById("theme-toggle").innerHTML = '<i class="fa-solid fa-sun"></i>'
  }

  // Set greeting based on time of day
  const hour = new Date().getHours()
  const welcomeText = document.querySelector(".welcome-text h2")
  if (hour < 12) {
    welcomeText.textContent = "Good morning, Bikram!"
  } else if (hour < 18) {
    welcomeText.textContent = "Good afternoon, Bikram!"
  } else {
    welcomeText.textContent = "Good evening, Bikram!"
  }
}

// Set up Event Listeners
function setupEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-btn")
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabGroup = this.closest(".card-tabs").querySelectorAll(".tab-btn")
      const tabContents = this.closest(".card").querySelectorAll(".tab-content")
      const tabName = this.getAttribute("data-tab")

      // Remove active class from all tabs
      tabGroup.forEach((tab) => tab.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to current tab
      this.classList.add("active")
      document.getElementById(`${tabName}-tab`).classList.add("active")
    })
  })

  // Weather update button
  const weatherUpdateBtn = document.getElementById("weather-update-btn")
  if (weatherUpdateBtn) {
    weatherUpdateBtn.addEventListener("click", function () {
      this.classList.add("updating")
      this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...'

      // Simulate update delay
      setTimeout(() => {
        updateWeatherData()
        this.classList.remove("updating")
        this.innerHTML = '<i class="fa-solid fa-rotate"></i> Update Now'
      }, 1500)
    })
  }

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode")
      if (document.body.classList.contains("dark-mode")) {
        this.innerHTML = '<i class="fa-solid fa-sun"></i>'
      } else {
        this.innerHTML = '<i class="fa-solid fa-moon"></i>'
      }
    })
  }

  // Language dropdown
  const languageBtn = document.getElementById("language-btn")
  const languageDropdown = document.getElementById("language-dropdown")
  if (languageBtn && languageDropdown) {
    languageBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      languageDropdown.classList.toggle("show")
    })

    const languageOptions = document.querySelectorAll(".language-option")
    languageOptions.forEach((option) => {
      option.addEventListener("click", function () {
        languageOptions.forEach((opt) => opt.classList.remove("selected"))
        this.classList.add("selected")
        languageDropdown.classList.remove("show")
      })
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      languageDropdown.classList.remove("show")
    })
  }

  // Tooltip functionality
  const tooltipTriggers = document.querySelectorAll(".tooltip-trigger")
  const tooltip = document.getElementById("tooltip")
  const tooltipContent = document.querySelector(".tooltip-content")

  tooltipTriggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", function (e) {
      const content = this.getAttribute("data-tooltip")
      tooltipContent.textContent = content

      const rect = this.getBoundingClientRect()
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`
      tooltip.style.left = `${rect.left + (rect.width / 2) - tooltip.offsetWidth / 2}px`

      tooltip.classList.add("show")
    })

    trigger.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show")
    })
  })

  // Bhumi AI Assistant
  const bhumiToggle = document.getElementById("bhumi-toggle")
  const bhumiChat = document.getElementById("bhumi-chat")
  const bhumiMinimized = document.getElementById("bhumi-minimized")
  const bhumiClose = document.getElementById("bhumi-close")
  const bhumiCloseMin = document.getElementById("bhumi-close-min")
  const bhumiMinimize = document.getElementById("bhumi-minimize")
  const bhumiMaximize = document.getElementById("bhumi-maximize")
  const bhumiSend = document.getElementById("bhumi-send")
  const bhumiInput = document.getElementById("bhumi-input-field")
  const bhumiMessages = document.getElementById("bhumi-messages")
  const bhumiVoice = document.getElementById("bhumi-voice")

  if (bhumiToggle) {
    bhumiToggle.addEventListener("click", function () {
      this.classList.toggle("open")
      if (bhumiMinimized.classList.contains("open")) {
        bhumiMinimized.classList.remove("open")
        bhumiChat.classList.add("open")
      } else if (bhumiChat.classList.contains("open")) {
        bhumiChat.classList.remove("open")
      } else {
        bhumiChat.classList.add("open")
      }
    })

    bhumiClose.addEventListener("click", () => {
      bhumiChat.classList.remove("open")
      bhumiToggle.classList.remove("open")
    })

    bhumiCloseMin.addEventListener("click", () => {
      bhumiMinimized.classList.remove("open")
      bhumiToggle.classList.remove("open")
    })

    bhumiMinimize.addEventListener("click", () => {
      bhumiChat.classList.remove("open")
      bhumiMinimized.classList.add("open")
    })

    bhumiMaximize.addEventListener("click", () => {
      bhumiMinimized.classList.remove("open")
      bhumiChat.classList.add("open")
    })

    bhumiSend.addEventListener("click", sendBhumiMessage)

    bhumiInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendBhumiMessage()
      }
    })

    bhumiVoice.addEventListener("click", function () {
      this.classList.toggle("recording")
      if (this.classList.contains("recording")) {
        this.innerHTML = '<i class="fa-solid fa-microphone" style="color: red;"></i>'
        // Simulate voice recording
        setTimeout(() => {
          this.classList.remove("recording")
          this.innerHTML = '<i class="fa-solid fa-microphone"></i>'
          bhumiInput.value = "When should I irrigate my wheat crop?"
        }, 2000)
      }
    })
  }

  function sendBhumiMessage() {
    if (bhumiInput.value.trim() === "") return

    // Add user message
    const userMessage = document.createElement("div")
    userMessage.className = "message user"
    userMessage.innerHTML = `
      <div class="message-bubble">
        <p>${bhumiInput.value}</p>
      </div>
      <div class="message-avatar">
        <img src="https://placehold.co/32x32" alt="User">
      </div>
    `
    bhumiMessages.appendChild(userMessage)

    // Scroll to bottom
    bhumiMessages.scrollTop = bhumiMessages.scrollHeight

    // Clear input
    const userQuestion = bhumiInput.value
    bhumiInput.value = ""

    // Simulate AI thinking
    setTimeout(() => {
      // Add AI response
      const aiResponse = getBhumiResponse(userQuestion)
      const assistantMessage = document.createElement("div")
      assistantMessage.className = "message assistant"
      assistantMessage.innerHTML = `
        <div class="message-avatar">
          <img src="https://placehold.co/32x32" alt="Bhumi">
        </div>
        <div class="message-bubble">
          <p>${aiResponse}</p>
        </div>
      `
      bhumiMessages.appendChild(assistantMessage)

      // Scroll to bottom
      bhumiMessages.scrollTop = bhumiMessages.scrollHeight
    }, 1000)
  }

  function getBhumiResponse(question) {
    // Simple response logic
    question = question.toLowerCase()

    if (question.includes("irrigate") || question.includes("water")) {
      return "Based on the current soil moisture levels (42%) and weather forecast, you should irrigate your wheat crop in 2-3 days. The ideal soil moisture for wheat at this stage is 50-60%."
    } else if (question.includes("fertilizer") || question.includes("nutrient")) {
      return "Your soil test shows slightly low nitrogen levels. I recommend applying nitrogen-rich fertilizer at a rate of 40-50 kg/hectare within the next week for optimal wheat growth."
    } else if (question.includes("pest") || question.includes("disease")) {
      return "I've analyzed recent pest alerts in your area. There's a medium risk of aphid infestation for wheat crops. Consider monitoring your field closely and prepare for preventive spraying if you notice any signs."
    } else if (question.includes("weather") || question.includes("rain")) {
      return "The weather forecast shows rain expected on Wednesday (27°C) and Friday (26°C). Plan your field activities accordingly, especially fertilizer application which should be done at least 24 hours before rainfall."
    } else if (question.includes("market") || question.includes("price")) {
      return "Current market prices for wheat in your region are ₹2250/quintal, which is 5.2% higher than last month. Based on market trends, prices are expected to remain stable or slightly increase in the coming weeks."
    } else {
      return "I'm here to help with your farming questions. You can ask me about weather impacts, soil health, crop recommendations, pest alerts, or market prices."
    }
  }
}

// Initialize Charts
function initializeCharts() {
  const priceChartElement = document.getElementById("price-chart")

  if (priceChartElement) {
    // Sample data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    const prices = [2000, 2100, 2050, 2150, 2200, 2180, 2250]

    // Create chart
    const ctx = document.createElement("canvas")
    ctx.width = priceChartElement.offsetWidth
    ctx.height = priceChartElement.offsetHeight
    priceChartElement.appendChild(ctx)

    new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Wheat Price (₹/quintal)",
            data: prices,
            borderColor: "#4361ee",
            backgroundColor: "rgba(67, 97, 238, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            titleColor: "#333",
            bodyColor: "#666",
            borderColor: "#ddd",
            borderWidth: 1,
            padding: 10,
            boxPadding: 5,
            usePointStyle: true,
            callbacks: {
              label: (context) => `₹${context.raw}/quintal`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: false,
            min: 1900,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
      },
    })
  }
}

// Initialize Gauges
function initializeGauges() {
  const gaugeElements = document.querySelectorAll(".gauge-value")

  gaugeElements.forEach((gauge) => {
    const value = Number.parseFloat(gauge.getAttribute("data-value"))
    const min = Number.parseFloat(gauge.getAttribute("data-min"))
    const max = Number.parseFloat(gauge.getAttribute("data-max"))

    // Calculate percentage
    const percentage = ((value - min) / (max - min)) * 100

    // Set CSS variable for the gauge
    gauge.style.setProperty("--gauge-percentage", `${percentage}%`)
  })
}

// Update Weather Data
function updateWeatherData() {
  // Generate random values
  const temp = Math.floor(Math.random() * 10) + 25 // 25-34°C
  const humidity = Math.floor(Math.random() * 30) + 50 // 50-79%
  const wind = Math.floor(Math.random() * 10) + 5 // 5-14 km/h
  const precipitation = Math.floor(Math.random() * 40) // 0-39%

  // Update DOM
  document.querySelector(".weather-info h2").textContent = `${temp}°C`

  const humidityProgress = document.querySelector(".weather-detail-item:nth-child(1) .progress")
  humidityProgress.style.width = `${humidity}%`
  document.querySelector(".weather-detail-item:nth-child(1) .progress-container span").textContent = `${humidity}%`

  document.querySelector(".weather-detail-item:nth-child(2) strong").textContent = `${wind} km/h`

  const precipitationProgress = document.querySelector(".weather-detail-item:nth-child(3) .progress")
  precipitationProgress.style.width = `${precipitation}%`
  document.querySelector(".weather-detail-item:nth-child(3) .progress-container span").textContent = `${precipitation}%`

  // Update last updated time
  document.querySelector(".weather-last-updated p:last-child").textContent = "Just now"
}

