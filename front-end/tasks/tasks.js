const tasks = [
  {
    id: 1,
    title: 'Review social creative for Summer promo',
    reward: 12.5,
    detail: 'Check the latest ad copy, confirm the CTA, and approve the visual before launch.',
    action: 'Approve the creative package and submit your review.'
  },
  {
    id: 2,
    title: 'Confirm inventory availability with publisher team',
    reward: 18,
    detail: 'Verify placements, confirm fill rates, and update the publisher notes in the tracker.',
    action: 'Confirm placements and send the availability update.'
  },
  {
    id: 3,
    title: 'Approve budget update for mobile placements',
    reward: 25,
    detail: 'Validate the updated spending cap and make sure the mobile spend is aligned with the campaign goal.',
    action: 'Approve the budget change and finalize the mobile plan.'
  },
  {
    id: 4,
    title: 'QA landing page link tracking',
    reward: 9.75,
    detail: 'Test the landing page links, confirm the tracking parameters, and report any broken links.',
    action: 'Run the QA checklist and mark the tracking fix complete.'
  }
];

const STORAGE_KEY = 'global-ad-network-balance';
const taskList = document.getElementById('task-list');
const selectedTaskName = document.getElementById('selected-task-name');
const selectedTaskReward = document.getElementById('selected-task-reward');
const taskInstructions = document.getElementById('task-instructions');
const finishMessage = document.getElementById('finish-message');
const completeTaskBtn = document.getElementById('complete-task-btn');
const balanceAmount = document.getElementById('balance-amount');
const balanceNote = document.getElementById('balance-note');

let currentBalance = Number(localStorage.getItem(STORAGE_KEY) || 120.5);
let selectedTask = tasks[0];

function updateBalanceDisplay() {
  balanceAmount.textContent = `$${currentBalance.toFixed(2)}`;
  balanceNote.textContent = 'Your current account balance updates as soon as you complete a task.';
}

function renderTasks() {
  taskList.innerHTML = tasks
    .map((task) => `
      <button class="task-card ${task.id === selectedTask.id ? 'selected-task' : ''}" type="button" data-task-id="${task.id}">
        <span class="task-chip">Reward $${task.reward.toFixed(2)}</span>
        <strong>${task.title}</strong>
        <p>${task.detail}</p>
        <span class="task-link">Open finish task section →</span>
      </button>
    `)
    .join('');
}

function selectTask(taskId) {
  selectedTask = tasks.find((task) => task.id === Number(taskId)) || tasks[0];
  selectedTaskName.textContent = selectedTask.title;
  selectedTaskReward.textContent = `Reward: $${selectedTask.reward.toFixed(2)}`;
  taskInstructions.textContent = selectedTask.action;
  finishMessage.textContent = 'This task is ready to finish. Click the button below once you have completed the checklist.';
  completeTaskBtn.disabled = false;
  renderTasks();
  document.getElementById('finish-task').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

completeTaskBtn.addEventListener('click', () => {
  currentBalance += selectedTask.reward;
  localStorage.setItem(STORAGE_KEY, currentBalance.toFixed(2));
  updateBalanceDisplay();
  finishMessage.textContent = `Task completed! $${selectedTask.reward.toFixed(2)} was added to your balance.`;
  completeTaskBtn.disabled = true;
});

if (taskList) {
  taskList.addEventListener('click', (event) => {
    const button = event.target.closest('.task-card');
    if (!button) return;
    selectTask(button.dataset.taskId);
  });
}

updateBalanceDisplay();
renderTasks();
selectTask(selectedTask.id);
