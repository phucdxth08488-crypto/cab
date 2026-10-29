
/* =========================
   1. MENU TRÊN ĐIỆN THOẠI
========================= */

function openMenu() {
    const menu = document.getElementById("menu");

    if (menu) {
        menu.classList.add("active");
    }
}

function closeMenu() {
    const menu = document.getElementById("menu");

    if (menu) {
        menu.classList.remove("active");
    }
}


/* =========================
   2. MENU NGÔN NGỮ
========================= */

function toggleLanguageMenu() {
    const menu = document.getElementById("languageMenu");

    if (menu) {
        menu.classList.toggle("active");
    }
}


/* =========================
   3. LƯU VÀ CHUYỂN NGÔN NGỮ
========================= */

function changeLanguage(language, name) {
    const label = document.getElementById("currentLanguage");
    const menu = document.getElementById("languageMenu");

    localStorage.setItem("selectedLanguage", language);

    if (label) {
        label.textContent = name;
    }

    if (menu) {
        menu.classList.remove("active");
    }

    // Cập nhật file MP3 nếu trang hiện tại có trình phát
    if (typeof updateAudioLanguage === "function") {
        updateAudioLanguage();
    }

    // Chuyển về tiếng Việt
    if (language === "vi") {
        document.cookie =
            "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

        document.cookie =
            "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" +
            window.location.hostname;

        window.location.reload();
        return;
    }

    let attempts = 0;

    function applyLanguage() {
        const translateSelect =
            document.querySelector(".goog-te-combo");

        if (!translateSelect) {
            attempts++;

            if (attempts < 30) {
                setTimeout(applyLanguage, 500);
            } else {
                console.warn("Google Translate chưa tải được.");
            }

            return;
        }

        const languageExists = Array.from(
            translateSelect.options
        ).some(function (option) {
            return option.value === language;
        });

        if (!languageExists) {
            attempts++;

            if (attempts < 30) {
                setTimeout(applyLanguage, 500);
            } else {
                console.warn("Ngôn ngữ chưa sẵn sàng.");
            }

            return;
        }

        translateSelect.value = language;

        translateSelect.dispatchEvent(
            new Event("change", { bubbles: true })
        );
    }

    applyLanguage();
}


/* =========================
   4. HIỂN THỊ NGÔN NGỮ ĐÃ LƯU
========================= */

document.addEventListener("DOMContentLoaded", function () {
    const savedLanguage =
        localStorage.getItem("selectedLanguage") || "vi";

    const languageNames = {
        "vi": "Tiếng Việt",
        "en": "English",
        "fr": "Français",
        "ko": "한국어",
        "zh-CN": "中文"
    };

    const label = document.getElementById("currentLanguage");

    if (label) {
        label.textContent =
            languageNames[savedLanguage] || "Tiếng Việt";
    }
});


/* =========================
   5. ĐÓNG MENU KHI NHẤN RA NGOÀI
========================= */

document.addEventListener("click", function (event) {
    const switcher =
        document.querySelector(".language-switcher");

    const menu =
        document.getElementById("languageMenu");

    if (switcher && menu && !switcher.contains(event.target)) {
        menu.classList.remove("active");
    }
});


/* =========================
   6. ẨN THANH GOOGLE TRANSLATE
========================= */

(function () {
    function hideGoogleTranslateBar() {
        document.querySelectorAll(
            "iframe.goog-te-banner-frame, .goog-te-banner-frame, iframe.VIpgJd-ZVi9od-ORHb-OEVmcd.skiptranslate"
        ).forEach(function (frame) {
            frame.style.setProperty("display", "none", "important");
            frame.style.setProperty("visibility", "hidden", "important");
            frame.style.setProperty("height", "0", "important");
            frame.style.setProperty("min-height", "0", "important");
            frame.style.setProperty("border", "0", "important");
        });

        document.documentElement.style.setProperty(
            "top", "0", "important"
        );

        if (document.body) {
            document.body.style.setProperty(
                "top", "0", "important"
            );

            document.body.style.setProperty(
                "margin-top", "0", "important"
            );
        }
    }

    function startObserver() {
        hideGoogleTranslateBar();

        const observer = new MutationObserver(function () {
            hideGoogleTranslateBar();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class"]
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startObserver
        );
    } else {
        startObserver();
    }
})();


/* =========================
   7. CHỌN NGÔN NGỮ ÂM THANH
========================= */

function getAudioLanguage() {
    return localStorage.getItem("selectedLanguage") || "vi";
}


function getAudioFile() {
    const language = getAudioLanguage();

    const audio = document.getElementById("voiceAudio");

    const prefix = audio
        ? audio.dataset.audioPrefix
        : "vua-dinh";

    const suffixes = {
        "vi": "vi",
        "en": "en",
        "fr": "fr",
        "ko": "ko",
        "zh-CN": "cn"
    };

    const suffix = suffixes[language] || "vi";

    return `audio/${prefix}-${suffix}.mp3`;
}


function updateVoiceStatus(message) {
    const status = document.getElementById("voiceStatus");

    if (status) {
        status.textContent = message;
    }
}


/* =========================
   8. PHÁT THUYẾT MINH MP3
========================= */

let voiceAudioPlayer = null;

function updateAudioLanguage() {
    const audio = document.getElementById("voiceAudio");

    if (!audio) {
        return;
    }

    const file = getAudioFile();
    const currentFile = audio.getAttribute("src");

    if (currentFile !== file) {
        audio.src = file;
        audio.load();

        updateVoiceStatus("Đã chọn âm thanh theo ngôn ngữ.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById("voiceAudio");
    const playButton = document.getElementById("voicePlay");
    const pauseButton = document.getElementById("voicePause");
    const stopButton = document.getElementById("voiceStop");

    if (!audio || !playButton || !pauseButton || !stopButton) {
        return;
    }

    voiceAudioPlayer = audio;

    // Nạp đúng file theo ngôn ngữ đã chọn
    updateAudioLanguage();

    // Nút Nghe
    playButton.addEventListener("click", async function () {
        updateAudioLanguage();

        try {
            await audio.play();
        } catch (error) {
            updateVoiceStatus(
                "Không phát được âm thanh. Hãy kiểm tra file MP3."
            );
        }
    });

    // Nút Tạm dừng / Tiếp tục
    pauseButton.addEventListener("click", function () {
        if (!audio.getAttribute("src")) {
            updateAudioLanguage();
        }

        if (!audio.paused) {
            audio.pause();
        } else if (audio.currentTime > 0 && !audio.ended) {
            audio.play().catch(function () {
                updateVoiceStatus(
                    "Không thể tiếp tục phát âm thanh."
                );
            });
        } else {
            updateVoiceStatus("Hãy nhấn Nghe để phát thuyết minh.");
        }
    });

    // Nút Dừng
    stopButton.addEventListener("click", function () {
        audio.pause();
        audio.currentTime = 0;

        updateVoiceStatus("Đã dừng thuyết minh.");
    });

    // Khi bắt đầu phát
    audio.addEventListener("play", function () {
        updateVoiceStatus("Đang phát thuyết minh...");
    });

    // Khi tạm dừng
    audio.addEventListener("pause", function () {
        if (audio.currentTime > 0 && !audio.ended) {
            updateVoiceStatus("Đã tạm dừng thuyết minh.");
        }
    });

    // Khi đọc xong
    audio.addEventListener("ended", function () {
        updateVoiceStatus("Đã đọc xong thuyết minh.");
    });

    // Khi không tải được file
    audio.addEventListener("error", function () {
        updateVoiceStatus(
            "Không tìm thấy file MP3. Hãy kiểm tra tên và đường dẫn."
        );
    });
});
/* =========================
   ẨN POPUP GOOGLE TRANSLATE
========================= */

(function () {
    function hideGoogleTranslatePopup() {
        const elements = document.querySelectorAll(
            ".goog-tooltip, .goog-te-balloon-frame, #goog-gt-tt"
        );

        elements.forEach(function (element) {
            element.style.setProperty(
                "display",
                "none",
                "important"
            );

            element.style.setProperty(
                "visibility",
                "hidden",
                "important"
            );

            element.style.setProperty(
                "opacity",
                "0",
                "important"
            );

            element.style.setProperty(
                "pointer-events",
                "none",
                "important"
            );
        });

        document.querySelectorAll(".goog-text-highlight")
            .forEach(function (element) {
                element.style.setProperty(
                    "background",
                    "transparent",
                    "important"
                );

                element.style.setProperty(
                    "box-shadow",
                    "none",
                    "important"
                );
            });
    }

    hideGoogleTranslatePopup();

    const observer = new MutationObserver(function () {
        hideGoogleTranslatePopup();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"]
    });
})();