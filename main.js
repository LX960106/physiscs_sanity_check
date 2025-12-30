document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit-button");
    const skipButton = document.getElementById("skip-button");
    const physicsReasonDiv = document.getElementById("physics-reasons");
    const kinematicsReasonDiv = document.getElementById("kinematics-reasons");
    const prevButton = document.getElementById("prev-button");

    const motionRangePanel = document.getElementById("motion-range-panel");
    const motionStartInput = document.getElementById("motion-start");
    const motionEndInput = document.getElementById("motion-end");
    const motionVideo = document.getElementById("motion-video");
    let hasMotionVideo = true;

    const axisPanel = document.getElementById("axis-panel");
    const positionPanel = document.getElementById("position-panel");
    const motionTypePanel = document.getElementById("motion-type-panel");
    const materialPanel = document.getElementById("material-category-panel");

    function updateMotionRangeVisibility() {
        const kinValid = document.querySelector("input[name='kinematics-valid']:checked")?.value;
        const motionRangeChecked = document.querySelector(
            "input[name='kinematics-reason'][value='motion_range']"
        )?.checked;

        if (kinValid === "false" && motionRangeChecked && motionVideo.style.display !== "none") {
            motionRangePanel.style.display = "block";
        } else {
            motionRangePanel.style.display = "none";
            motionStartInput.value = "0";
            motionEndInput.value = "3";
        }
    }

    function handleKinematicsValidityChange(value) {
        const typeCheckbox = document.querySelector(
            "input[name='kinematics-reason'][value='type']"
        );

        if (value === "false" && !hasMotionVideo) {
            // 没视频 + 不合理 → 默认 motion type
            typeCheckbox.checked = true;

            // 触发你已有的联动逻辑
            typeCheckbox.dispatchEvent(new Event("change"));
        }
    }

    function updateReasonUI() {
        const kinValid = document.querySelector("input[name='kinematics-valid']:checked")?.value;
        const reasons = Array.from(
            document.querySelectorAll("input[name='kinematics-reason']:checked")
        ).map(i => i.value);


        if (kinValid !== "false") {
            //alert("aaa")
            axisPanel.style.display = "none";
            positionPanel.style.display = "none";
            motionRangePanel.style.display = "none";
            motionTypePanel.style.display = "none";
            // 顺手把 reason 也 reset（可选，但我强烈建议）
            document.querySelectorAll("input[name='kinematics-reason']").forEach(i => {
                i.checked = false;
                i.disabled = false;
                i.parentElement.style.opacity = "1.0";
            });
            document.querySelectorAll("input[name='axis-choice']").forEach(i => i.checked = false);
            document.querySelectorAll("input[name='position-choice']").forEach(i => i.checked = false);
            document.querySelectorAll("input[name='motion-type']").forEach(i => i.checked = false);
            motionStartInput.value = "0";
            motionEndInput.value = "3";
            return;
        }

        if (reasons.includes("motion_range") && motionVideo.style.display !== "none") {
            motionRangePanel.style.display = "block";
        } else {
            motionRangePanel.style.display = "none";
            motionStartInput.value = "0";
            motionEndInput.value = "3";
        }

        if (reasons.includes("axis")) {
            axisPanel.style.display = "block";
        } else {
            axisPanel.style.display = "none";
            document.querySelectorAll("input[name='axis-choice']").forEach(i => i.checked = false);
        }

        if (reasons.includes("position")) {
            positionPanel.style.display = "block";
        } else {
            positionPanel.style.display = "none";
            document.querySelectorAll("input[name='position-choice']").forEach(i => i.checked = false);
        }

        // motion type 是“终止态”
        const typeChecked = reasons.includes("type");
        if (typeChecked) {
            motionTypePanel.style.display = "block";
        } else {
            motionTypePanel.style.display = "none";
            document.querySelectorAll("input[name='motion-type']").forEach(i => i.checked = false);
        }
        document.querySelectorAll("input[name='kinematics-reason']").forEach(i => {
            if (i.value !== "type") {
                i.disabled = typeChecked;
                if (typeChecked) i.checked = false;
            }
        });
    }



    function setupMotionTypeExclusiveLogic() {
        const typeCheckbox = document.querySelector(
            "input[name='kinematics-reason'][value='type']"
        );

        const otherCheckboxes = Array.from(
            document.querySelectorAll(
                "input[name='kinematics-reason']:not([value='type'])"
            )
        );

        typeCheckbox.addEventListener("change", () => {
            if (typeCheckbox.checked) {
                // 勾选 Motion Type → 禁用其他
                otherCheckboxes.forEach(cb => {
                    cb.checked = false;
                    cb.disabled = true;
                    cb.parentElement.style.opacity = "0.5";
                });
            } else {
                // 取消 Motion Type → 恢复
                otherCheckboxes.forEach(cb => {
                    cb.disabled = false;
                    cb.parentElement.style.opacity = "1.0";
                });
            }
        });
    }
    setupMotionTypeExclusiveLogic();


    document.querySelectorAll("input[name='kinematics-valid']").forEach(i =>
        i.addEventListener("change", () => {
            //updateMotionRangeVisibility();
            handleKinematicsValidityChange(i.value);
            updateReasonUI();
        })
    );


    document.querySelectorAll("input[name='kinematics-reason']").forEach(i =>
        i.addEventListener("change", () => {
            //updateMotionRangeVisibility();
            updateReasonUI();
        })
    );


    motionVideo.addEventListener("click", () => {
        const t = motionVideo.currentTime.toFixed(2);
        motionEndInput.value = t;
    });




    document.querySelectorAll("input[name='physics-valid']").forEach(input => {
        input.addEventListener("change", () => {
            if (input.value === "false") {
                physicsReasonDiv.style.display = "block";
            } else {
                physicsReasonDiv.style.display = "none";
                //document.querySelectorAll("input[name='physics-reason']").forEach(checkbox => checkbox.checked = false);
                materialPanel.style.display = "none";

                // reset
                document.querySelectorAll("input[name='physics-reason']").forEach(c => c.checked = false);
                document.querySelectorAll("input[name='material-category']").forEach(r => r.checked = false);
            }
        });
    });

    document.querySelectorAll("input[name='physics-reason']").forEach(cb => {
        cb.addEventListener("change", () => {
            const semanticChecked =
                document.querySelector("input[name='physics-reason'][value='semantic']")?.checked;

            const materialPanel = document.getElementById("material-category-panel");

            if (semanticChecked) {
                materialPanel.style.display = "block";
            } else {
                materialPanel.style.display = "none";
                document.querySelectorAll("input[name='material-category']").forEach(r => r.checked = false);
            }
        });
    });


    document.querySelectorAll("input[name='kinematics-valid']").forEach(input => {
        input.addEventListener("change", () => {
            if (input.value === "false") {
                kinematicsReasonDiv.style.display = "block";
            } else {
                kinematicsReasonDiv.style.display = "none";
                document.querySelectorAll("input[name='kinematics-reason']").forEach(checkbox => checkbox.checked = false);
            }
        });
    });

    let sha256List = [];
    let currentIndex = 0;
    let currentSha256 = null;

    function fetchSha256List(reviewerId, totalUserNum) {
        return fetch(`/data/ids/${reviewerId}/${totalUserNum}`) // Assuming an API endpoint that returns all sha256 IDs
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch sha256 list");
                }
                return response.json();
            })
            .then(data => {
                sha256List = data;
                currentIndex = 0;
                loadData();
            })
            .catch(error => {
                console.error("Error fetching sha256 list:", error);
                alert("Failed to load sha256 list. Please try again.");
            });
    }
    function resetFormState() {
        // Physics
        document.querySelectorAll("input[name='physics-valid']").forEach(i => i.checked = false);
        document.querySelectorAll("input[name='physics-reason']").forEach(i => i.checked = false);
        document.querySelectorAll("input[name='material-category']").forEach(i => i.checked = false);
        materialPanel.style.display = "none";
        physicsReasonDiv.style.display = "none";

        // Kinematics
        document.querySelectorAll("input[name='kinematics-valid']").forEach(i => i.checked = false);
        document.querySelectorAll("input[name='kinematics-reason']").forEach(i => i.checked = false);
        kinematicsReasonDiv.style.display = "none";

        // Motion range
        motionRangePanel.style.display = "none";
        motionStartInput.value = "0";
        motionEndInput.value = "3";

        const typeCheckbox = document.querySelector(
            "input[name='kinematics-reason'][value='type']"
        );
        typeCheckbox.disabled = false;
        typeCheckbox.dispatchEvent(new Event("change"));


    }

    function getReviewerId() {
        const params = new URLSearchParams(window.location.search);
        const v = params.get("reviewer");

        // 默认值
        let reviewerId = -1;
        let totalUserNum = -1;

        if (!v) {
            return { reviewerId, totalUserNum };
        }

        // 期望格式: "10/20"
        const parts = v.split("/");

        if (parts.length !== 2) {
            return { reviewerId, totalUserNum };
        }

        const rid = parseInt(parts[0], 10);
        const total = parseInt(parts[1], 10);

        if (
            Number.isNaN(rid) ||
            Number.isNaN(total) ||
            rid < 1 ||
            total < 1 ||
            rid > total
        ) {
            return { reviewerId, totalUserNum };
        }

        reviewerId = rid;
        totalUserNum = total;

        return { reviewerId, totalUserNum };

    }

    function goToPrevious() {
        if (currentIndex <= 0) {
            alert("This is the first sample.");
            return;
        }
        currentIndex--;
        loadData();
    }

    function loadData() {
        if (currentIndex >= sha256List.length) {
            alert("All samples have been annotated.");
            currentIndex--;
            return;
        }

        resetFormState();

        const sha256 = sha256List[currentIndex];
        currentSha256 = sha256;
        fetch(`/data/${sha256}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                return response.json();
            })
            .then(data => {
                document.getElementById("dataset").textContent = data.dataset;
                document.getElementById("type-name").textContent = data.type_name;
                document.getElementById("asset-id").textContent = data.asset_id;
                document.getElementById("part-id").textContent = data.label;
                document.getElementById("part-progress").textContent = `${currentIndex + 1} / ${sha256List.length}`;

                const globalView = document.getElementById("global-view");
                const oriView = document.getElementById("ori-view");
                const axisView = document.getElementById("axis-view");
                const pivotView = document.getElementById("pivot-view");

                axisView.src = data.axis_pth;
                axisView.alt = `Motion axis visualization for ${data.name}`;
                pivotView.src = data.pivot_pth;
                pivotView.alt = `Motion pivot visualization for ${data.name}`;
                oriView.src = data.ori_img_pth;
                oriView.alt = `Original view of ${data.name}`;
                globalView.src = data.global_img_pth;
                globalView.alt = `Global view of ${data.name}`;

                const video = document.getElementById("motion-video");
                const videoSource = document.getElementById("video-source");
                const noMotionHint = document.getElementById("no-motion-hint");
                if (data.video_pth && data.video_pth.trim() !== "") {
                    hasMotionVideo = true;
                    videoSource.src = data.video_pth;
                    video.style.display = "block";
                    noMotionHint.style.display = "none";
                    video.load();   // 重新加载媒体
                    video.play();  // （可选）如果你想自动播放
                } else {
                    hasMotionVideo = false;
                    video.pause();
                    videoSource.src = "";
                    video.style.display = "none";
                    noMotionHint.style.display = "flex";

                }

                const propertyTable = document.getElementById("property-table");
                propertyTable.innerHTML = ""; // Clear existing rows

                const properties = [
                    { name: "Part Label", value: data.label, class: "part-label" },
                    { name: "Part Name", value: data.name, class: "part-name" },
                    { name: "Material", value: data.material, class: "material" },
                    { name: "Density", value: `${data.density} g/cm^3`, class: "density" },
                    { name: "Young's Modulus", value: `${data.young} GPa`, class: "youngs-modulus" },
                    { name: "Hardness", value: `${data.hardness} HV`, class: "hardness" },
                    { name: "Poisson's Ratio", value: data.poisson, class: "poisson-ratio" },
                    { name: "Friction Coefficient", value: data.friction, class: "friction-coefficient" }
                ];

                properties.forEach(prop => {
                    const row = document.createElement("tr");
                    const nameCell = document.createElement("td");
                    nameCell.textContent = prop.name;
                    const valueCell = document.createElement("td");
                    valueCell.textContent = prop.value;
                    const unitCell = document.createElement("td");
                    unitCell.textContent = ""; // Add units if necessary

                    row.className = prop.class;
                    row.appendChild(nameCell);
                    row.appendChild(valueCell);
                    row.appendChild(unitCell);
                    propertyTable.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Error loading data:", error);
                alert("Failed to load data. Please try again.");
            });
    }

    function parseValidity(v) {
        if (v === "true") return true;
        if (v === "false") return false;
        return null; // unknown / cannot judge
    }

    function validateBeforeSubmit() {
        const physicsValid = document.querySelector(
            "input[name='physics-valid']:checked"
        )?.value;

        const kinematicsValid = document.querySelector(
            "input[name='kinematics-valid']:checked"
        )?.value;

        if (!physicsValid || !kinematicsValid) {
            alert("Please complete all required fields before submitting.");
            return false;
        }

        /* ---------- Physics ---------- */
        if (physicsValid === "false") {
            const physicsReasons = Array.from(document.querySelectorAll(
                "input[name='physics-reason']:checked"
            )).map(i => i.value);
            if (physicsReasons.length === 0) {
                alert("Please select at least one Physics Unreasonable Reason.");
                return false;
            } else if (physicsReasons.includes("semantic")) {
                const materialSelected = document.querySelector("input[name='material-category']:checked");
                if (!materialSelected) {
                    alert("Please select a correct material category for semantic unreasonableness.");
                    return false;
                }
            }
        }


        /* ---------- Kinematics ---------- */
        if (kinematicsValid === "false") {
            const reasons = Array.from(
                document.querySelectorAll("input[name='kinematics-reason']:checked")
            ).map(i => i.value);

            if (reasons.length === 0) {
                alert("Please select at least one Kinematics Unreasonable Reason.");
                return false;
            }
            if (reasons.includes("type")) {
                const motionType = document.querySelector(
                    "input[name='motion-type']:checked"
                );
                if (!motionType) {
                    alert("Please select a candidate motion type.");
                    return false;
                }
            }
            // motion axis → 必须选 axis-choice
            if (reasons.includes("axis")) {
                const axisChoice = document.querySelector(
                    "input[name='axis-choice']:checked"
                );
                if (!axisChoice) {
                    alert("Please select a candidate motion axis.");
                    return false;
                }
            }

            // motion position → 必须选 position-choice
            if (reasons.includes("position")) {
                const positionChoice = document.querySelector(
                    "input[name='position-choice']:checked"
                );
                if (!positionChoice) {
                    alert("Please select a candidate motion position cluster.");
                    return false;
                }
            }

            // motion range（如果你有）
            if (reasons.includes("range")) {
                const start = parseFloat(
                    document.getElementById("motion-start")?.value
                );
                const end = parseFloat(
                    document.getElementById("motion-end")?.value
                );

                if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
                    alert("Please provide a valid motion range (end > start).");
                    return false;
                }
            }
        }

        return true;
    }

    function submitResult(skip = false) {
        if (skip) {
            currentIndex++;
            loadData();
            return;
        }

        const assetId = document.getElementById("asset-id").textContent;
        const partId = document.getElementById("part-id").textContent;
        const physicsValid = document.querySelector("input[name='physics-valid']:checked")?.value;
        const kinematicsValid = document.querySelector("input[name='kinematics-valid']:checked")?.value;

        // if (!physicsValid || !kinematicsValid) {
        //     alert("Please complete all required fields before submitting.");
        //     return;
        // }

        if (!validateBeforeSubmit()) {
            return;
        }



        const physicsReasons = Array.from(document.querySelectorAll("input[name='physics-reason']:checked"))
            .map(checkbox => checkbox.value);
        const kinematicsReasons = Array.from(document.querySelectorAll("input[name='kinematics-reason']:checked"))
            .map(checkbox => checkbox.value);

        let motionRange = { start: 0, end: 3 };
        if (
            kinematicsValid === "false" &&
            kinematicsReasons.includes("motion_range")
        ) {
            const s = parseFloat(motionStartInput.value);
            const e = parseFloat(motionEndInput.value);

            if (!Number.isNaN(s) && !Number.isNaN(e) && s < e) {
                motionRange = { start: s, end: e };
            }
        }

        const result = {
            sha256: currentSha256,
            asset_id: assetId,
            part_id: partId,
            physics_valid: physicsValid,
            physics_reasons: physicsValid === "false" ? physicsReasons : [],
            kinematics_valid: kinematicsValid,
            kinematics_reasons: kinematicsValid === "false" ? kinematicsReasons : [],
            motion_type: document.querySelector("input[name='motion-type']:checked")?.value || null,
            material_category: document.querySelector("input[name='material-category']:checked")?.value || null,
            axis_choice: document.querySelector("input[name='axis-choice']:checked")?.value || null,
            position_choice: document.querySelector("input[name='position-choice']:checked")?.value || null,
            motion_range: motionRange,
            skip: skip,
            reviewer_id: reviewerId,
            timestamp: new Date().toISOString()
        };
        // alert("Submitting result: " + JSON.stringify(result, null, 2));
        fetch("/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to submit result");
                }
                return response.json();
            })
            .then(info => {
                alert(info.message);
                // Load next data
                currentIndex++;
                loadData();
            })
            .catch(error => {
                console.error("Error submitting result:", error);
                alert("Failed to submit result. Please try again.");
            });
    }

    submitButton.addEventListener("click", () => submitResult(false));
    skipButton.addEventListener("click", () => submitResult(true));
    prevButton.addEventListener("click", goToPrevious);

    document.querySelectorAll('img.zoomable').forEach(img => {
        img.addEventListener('dblclick', () => {
            if (img.classList.contains('zoomed')) {
                img.classList.remove('zoomed');
            } else {
                document.querySelectorAll('img.zoomable.zoomed').forEach(zoomedImg => zoomedImg.classList.remove('zoomed'));
                img.classList.add('zoomed');
            }
        });
    });
    const { reviewerId, totalUserNum } = getReviewerId();
    alert("Initializing reviewer ID: " + reviewerId + " / " + totalUserNum);
    fetchSha256List(reviewerId, totalUserNum);
});