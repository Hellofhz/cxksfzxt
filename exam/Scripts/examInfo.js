document.addEventListener("DOMContentLoaded", () => {
    const examNameElem = document.getElementById("examName");
    const messageElem = document.getElementById("message");
    const currentTimeElem = document.getElementById("current-time");
    const currentSubjectElem = document.getElementById("current-subject");
    const examTimingElem = document.getElementById("exam-timing");
    const remainingTimeElem = document.getElementById("remaining-time");
    const statusElem = document.getElementById("status");
    const examTableBodyElem = document.getElementById("exam-table-body");
    const roomElem = document.getElementById("room");
    let offsetTime = getCookie("offsetTime") || 0;

    function fetchData() {
        return fetch('exam_config.json', { cache: "no-store" })
            .then(response => response.json())
            .then(data => {
                displayExamInfo(data);
                updateCurrentTime();
                updateExamInfo(data);
                setInterval(() => updateCurrentTime(), 1000);
                setInterval(() => updateExamInfo(data), 1000);
            })
            .catch(error => errorSystem.show('获取考试数据失败: ' + error.message));
    }

    function displayExamInfo(data) {
        try {
            const examNameText = data.examName;
            const roomText = roomElem.textContent;
            examNameElem.innerHTML = `${examNameText} <span id="room">${roomText}</span>`;
            messageElem.textContent = data.message;
        } catch (e) {
            errorSystem.show('显示考试信息失败: ' + e.message);
        }
    }

    function updateCurrentTime() {
        try {
            const now = new Date(new Date().getTime() + offsetTime * 1000);
            currentTimeElem.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
        } catch (e) {
            errorSystem.show('更新时间失败: ' + e.message);
        }
    }

    function updateExamInfo(data) {
        try {
            const now = new Date(new Date().getTime() + offsetTime * 1000);
            let currentExam = null;
            let nextExam = null;
            let lastExam = null;

            data.examInfos.forEach(exam => {
                const start = new Date(exam.start);
                const end = new Date(exam.end);
                if (now >= start && now <= end) {
                    currentExam = exam;
                }
                if (!currentExam && !nextExam && now < start) {
                    nextExam = exam;
                }
                if (now > end && (!lastExam || end > new Date(lastExam.end))) {
                    lastExam = exam;
                }
            });

            if (currentExam) {
                currentSubjectElem.textContent = `当前科目: ${currentExam.name}`;
                examTimingElem.textContent = `起止时间: ${formatTimeWithoutSeconds(new Date(currentExam.start).toLocaleTimeString('zh-CN', { hour12: false }))} - ${formatTimeWithoutSeconds(new Date(currentExam.end).toLocaleTimeString('zh-CN', { hour12: false }))}`;
                const remainingTime = (new Date(currentExam.end).getTime() - now.getTime() + 1000) / 1000;
                const remainingHours = Math.floor(remainingTime / 3600);
                const remainingMinutes = Math.floor((remainingTime % 3600) / 60);
                const remainingSeconds = Math.floor(remainingTime % 60);
                const remainingTimeText = `${remainingHours}时 ${remainingMinutes}分 ${remainingSeconds}秒`;

                if (remainingHours === 0 && remainingMinutes <= 14) {
                    remainingTimeElem.textContent = `倒计时: ${remainingTimeText}`;
                    remainingTimeElem.style.color = "red";
                    remainingTimeElem.style.fontWeight = "bold";
                } else {
                    remainingTimeElem.textContent = `剩余时间: ${remainingTimeText}`;
                    remainingTimeElem.style.color = "#93b4f7";
                    remainingTimeElem.style.fontWeight = "normal";
                }

                statusElem.textContent = "状态: 进行中";
                statusElem.style.color = "#5ba838";
            } else if (lastExam && now < new Date(lastExam.end).getTime() + 60000) {
                const timeSinceEnd = (now.getTime() - new Date(lastExam.end).getTime()) / 1000;
                currentSubjectElem.textContent = `上场科目: ${lastExam.name}`;
                examTimingElem.textContent = "";
                remainingTimeElem.textContent = ``;
                statusElem.textContent = "状态: 已结束";
                statusElem.style.color = "red";
            } else if (nextExam) {
                const timeUntilStart = ((new Date(nextExam.start).getTime() - now.getTime()) / 1000) + 1;
                const remainingHours = Math.floor(timeUntilStart / 3600);
                const remainingMinutes = Math.floor((timeUntilStart % 3600) / 60);
                const remainingSeconds = Math.floor(timeUntilStart % 60);
                const remainingTimeText = `${remainingHours}时 ${remainingMinutes}分 ${remainingSeconds}秒`;

                if (timeUntilStart <= 15 * 60) {
                    currentSubjectElem.textContent = `即将开始: ${nextExam.name}`;
                    remainingTimeElem.textContent = `倒计时: ${remainingTimeText}`;
                    remainingTimeElem.style.color = "orange";
                    remainingTimeElem.style.fontWeight = "bold";
                    statusElem.textContent = "状态: 即将开始";
                    statusElem.style.color = "#DBA014";
                } else {
                    currentSubjectElem.textContent = `下一场科目: ${nextExam.name}`;
                    remainingTimeElem.textContent = "";
                    statusElem.textContent = "状态: 未开始";
                    remainingTimeElem.style.fontWeight = "normal";
                    statusElem.style.color = "#EAEE5B";
                }

                examTimingElem.textContent = `起止时间: ${formatTimeWithoutSeconds(new Date(nextExam.start).toLocaleTimeString('zh-CN', { hour12: false }))} - ${formatTimeWithoutSeconds(new Date(nextExam.end).toLocaleTimeString('zh-CN', { hour12: false }))}`;
            } else {
                currentSubjectElem.textContent = "考试均已结束";
                examTimingElem.textContent = "";
                remainingTimeElem.textContent = "";
                statusElem.textContent = "状态: 空闲";
                statusElem.style.color = "#3946AF";
            }

            examTableBodyElem.innerHTML = "";
            data.examInfos.forEach(exam => {
                const start = new Date(exam.start);
                const end = new Date(exam.end);
                let status = "";
                if (now < start) {
                    status = "即将开始";
                } else if (now > end) {
                    status = "已结束";
                } else {
                    status = "进行中";
                }

                const row = document.createElement("tr");
                row.className = `exam-status-${status}`;
                row.innerHTML = `
                    <td>${exam.name}</td>
                    <td>${formatTimeWithoutSeconds(new Date(exam.start).toLocaleTimeString('zh-CN', { hour12: false }))}</td>
                    <td>${formatTimeWithoutSeconds(new Date(exam.end).toLocaleTimeString('zh-CN', { hour12: false }))}</td>
                `;
                examTableBodyElem.appendChild(row);
            });
        } catch (e) {
            errorSystem.show('更新考试信息失败: ' + e.message);
        }
    }

    fetchData();
});
