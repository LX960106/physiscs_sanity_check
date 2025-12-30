# Physics Sanity Check Tool

## 1. Quick Start
```bash
node sever.js
# 本地启动项目，浏览器键入：http://localhost:3000/?reviewer=1/1读取所有代标注的文件逐条展示
```
* 如果多人标注，打开浏览器访问 http://localhost:3000/?reviewer=1/3 表示 id=1的用户进行标注，标注人数为3。系统内部会根据用户的ID，自动分配对应的标注文件。具体算法：利用标注文件json的文件名（file_name,file_nams为sha256 hash后的hash值）除以总用户数取余等该用户id的文件，即为该用户需要标注的文件。逻辑展示如下：

```js
files
    .filter(file => file.endsWith(".json"))
    .forEach(file => {
        const baseName = path.basename(file, ".json");

        // 已经标过的直接跳过
        if (finishedSet.has(baseName)) return;

        // sha256 前 8 位 hex → int
        const hashPrefix = baseName.slice(0, 8);
        const hashInt = parseInt(hashPrefix, 16);
        if (isNaN(hashInt)) return;

        const modVal = hashInt % totalUserNum;

        if (modVal === reviewerIndex) {
            assignedIds.push(baseName);
        }
    });
```

### 1.1 目录结构
`data`目录下4个子目录：
* `json`存储待标注的部件，文件命名方式：sha256(model_id)_sha256(unique_str).json，进行sha256 hash操作得到文件名。
* `imgs` 和 `videos`存储`json`中需要的资源文件

* `results` 目录存储标注结果，文件以.json存储，文件名同`json`目录文件名对应


## 2. 项目简介

**Physics Sanity Check Tool** 是一个用于 **3D 资产物理属性与运动标注结果人工核查（Human-assisted sanity check）** 的可视化工具。

该工具面向大规模 3D 数据集的 **物理一致性验证场景**，支持对以下内容进行逐部件（part-level）检查与修正：

* 物理属性是否符合人类直觉（Physics Validity）
* 运动学预测是否合理（Kinematics Validity）
* 运动类型、运动轴、运动位置、运动时间范围的纠正
* 材质语义不一致时的**材质大类修正**

该工具主要用于：

* 构建 **高质量 benchmark 数据**
* 分析自动标注 / 预测流程中的系统性错误
* 为后续物理属性预测模型训练提供可信的人工校验数据

---

## 3. 设计目标

本项目并非一个自动标注系统，而是一个 **低偏置、强约束的人在环（Human-in-the-loop）核查工具**，核心目标包括：

1. **发现不合理，而不是强行“修正为真值”**
2. 仅在必要时引入人工判断，避免过度主观标注
3. 对错误类型进行结构化归因，便于统计与分析
4. 支持规模化标注（数千级样本）

---

## 4. 支持的检查维度

### 4.1. Physics Validity（物理合理性）

判断当前部件的物理属性（材质）是否合理：

* **Reasonable**：物理属性符合直觉
* **Unreasonable**：明显不合理
* **Unknown**：无法判断（如渲染异常、信息缺失）

当选择 *Unreasonable* 时，可进一步指定原因：

* **Semantic Unreasonableness**：材质语义与物理属性不匹配
* **Other / Cannot Judge**

#### 材质大类修正（仅在 Semantic Unreasonableness 时出现）

用于标注“更符合直觉的材质大类”，包括：

* metal
* plastic
* fabric
* leather
* foam
* rubber
* glass
* stone
* ceramics
* wood
* concrete
* other（有机物、液体、凝胶、食物等）

> 注：此处仅标注**材质大类**，不涉及具体材料型号。

---

### 4.2 Kinematics Validity（运动学合理性）

判断预测的部件运动是否合理：

* **Reasonable**
* **Unreasonable**
* **Unknown**

当选择 *Unreasonable* 时，可选择多个错误原因：

* **Motion Type**：运动类型错误（如应静止却被预测为运动）
* **Motion Axis**：运动轴方向不合理
* **Motion Position**：旋转中心 / 平移起点不合理
* **Motion Range**：运动时间区间不合理

---

## 5.运动纠正交互设计

### 5.1 Motion Type Correction

当 Motion Type 错误时，要求选择正确类型之一：

* Rotation
* Translation
* Contact-only
* Rigid Body

### 5.2 Motion Axis Correction

* 展示候选运动轴可视化图像
* 提供 **10 个候选轴**（原始 xyz 轴 + 平面拟合轴）
* 使用颜色编码进行区分，人工选择最合理轴

### 5.3 Motion Position Correction

* 展示旋转中心 / 平移起点的聚类结果
* 提供 **6 个候选位置**
* 使用不同颜色点表示

### 5.4 Motion Range Correction

* 通过起止时间（秒）标注合理运动区间

---

## 6. 无运动情况处理

当当前部件未检测到运动或无法生成运动视频时：

* 显示 *No motion detected for this part*
* 若用户选择 *Unreasonable*，系统默认认为 **Motion Type 错误**
* 避免用户在信息不足情况下做轴 / 位置判断

---

## 7. 数据完整性约束

为保证标注质量，工具对提交行为进行严格校验：

* 若选择 *Unreasonable*，必须至少给出对应原因
* 对每一类错误，相关子选项 **必须选择**
* 未完成必填项时禁止提交

---

## 8. 典型使用流程

1. 加载资产与部件信息
2. 查看全局视图、原始渲染图与运动视频
3. 判断 Physics / Kinematics 是否合理
4. 若不合理，逐层选择错误原因并进行纠正
5. 提交结果并进入下一个部件

---

## 9. 适用场景

* 3D 资产物理属性自动标注结果核查
* 物理一致性 benchmark 构建
* Sim-to-Real 偏差分析
* 物理属性预测模型误差诊断

---

## 10. 项目定位说明

本工具的目标不是生成“绝对真值”，而是：

> **通过人类直觉与物理常识，对自动流程进行系统性 sanity check，并形成结构化错误标签。**

该设计在保证效率的同时，最大限度降低人工标注引入的主观偏差。

---
