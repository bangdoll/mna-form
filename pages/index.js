import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [formData, setFormData] = useState({
    isAnonymous: true, // 預設為匿名
    name: '',
    gender: 'male',
    dob: '',
    weight: '',
    height: '',
    kneeHeight: '',
    answers: {
      // 營養篩檢
      appetite: '', // 食慾問題
      weight_change: '', // 體重變化
      mobility: '', // 行動力
      stress: '', // 精神壓力或急性疾病
      neuro: '', // 神經精神問題
      bmi: '', // BMI
      
      // 一般評估
      living: '', // 獨立生活
      medication: '', // 處方藥
      pressure_ulcers: '', // 褥瘡
      meals: '', // 完整餐食
      
      // 蛋白質攝取
      dairy: '', // 乳製品
      legumes: '', // 豆類或蛋類
      meat: '', // 肉類
      
      // 其他評估
      vegetables: '', // 蔬菜水果
      fluid: '', // 液體攝取
      feeding_mode: '', // 進食形式
      nutrition_problem: '', // 營養問題
      health_comparison: '', // 健康狀況比較
      mac: '', // 臂中圍
      cc: '' // 小腿圍
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    const answers = formData.answers;

    // 營養篩檢 (滿分14分)
    // 1. 食慾問題
    if (answers.appetite === 'severe') totalScore += 0;
    else if (answers.appetite === 'moderate') totalScore += 1;
    else if (answers.appetite === 'none') totalScore += 2;

    // 2. 體重變化
    if (answers.weight_change === 'severe') totalScore += 0;
    else if (answers.weight_change === 'unknown') totalScore += 1;
    else if (answers.weight_change === 'moderate') totalScore += 2;
    else if (answers.weight_change === 'none') totalScore += 3;

    // 3. 行動力
    if (answers.mobility === 'bed') totalScore += 0;
    else if (answers.mobility === 'limited') totalScore += 1;
    else if (answers.mobility === 'normal') totalScore += 2;

    // 4. 精神壓力或急性疾病
    if (answers.stress === 'yes') totalScore += 0;
    else if (answers.stress === 'no') totalScore += 2;

    // 5. 神經精神問題
    if (answers.neuro === 'severe') totalScore += 0;
    else if (answers.neuro === 'mild') totalScore += 1;
    else if (answers.neuro === 'none') totalScore += 2;

    // 6. BMI
    if (answers.bmi === 'low') totalScore += 0;
    else if (answers.bmi === 'medium_low') totalScore += 1;
    else if (answers.bmi === 'medium_high') totalScore += 2;
    else if (answers.bmi === 'high') totalScore += 3;

    // 一般評估 (滿分16分)
    // 7. 獨立生活
    if (answers.living === 'yes') totalScore += 1;
    else if (answers.living === 'no') totalScore += 0;

    // 8. 處方藥
    if (answers.medication === 'yes') totalScore += 1;
    else if (answers.medication === 'no') totalScore += 0;

    // 9. 褥瘡
    if (answers.pressure_ulcers === 'yes') totalScore += 1;
    else if (answers.pressure_ulcers === 'no') totalScore += 0;

    // 10. 完整餐食
    if (answers.meals === 'one') totalScore += 0;
    else if (answers.meals === 'two') totalScore += 1;
    else if (answers.meals === 'three') totalScore += 2;

    // 11. 蛋白質攝取
    let proteinScore = 0;
    if (answers.dairy === 'yes') proteinScore += 1;
    if (answers.legumes === 'yes') proteinScore += 1;
    if (answers.meat === 'yes') proteinScore += 1;
    if (proteinScore <= 1) totalScore += 0;
    else if (proteinScore === 2) totalScore += 0.5;
    else totalScore += 1;

    // 12. 蔬菜水果
    if (answers.vegetables === 'yes') totalScore += 1;
    else if (answers.vegetables === 'no') totalScore += 0;

    // 13. 液體攝取
    if (answers.fluid === 'low') totalScore += 0;
    else if (answers.fluid === 'medium') totalScore += 0.5;
    else if (answers.fluid === 'high') totalScore += 1;

    // 14. 進食形式
    if (answers.feeding_mode === 'assisted') totalScore += 0;
    else if (answers.feeding_mode === 'difficult') totalScore += 1;
    else if (answers.feeding_mode === 'independent') totalScore += 2;

    // 15. 營養問題
    if (answers.nutrition_problem === 'severe') totalScore += 0;
    else if (answers.nutrition_problem === 'mild') totalScore += 1;
    else if (answers.nutrition_problem === 'none') totalScore += 2;

    // 16. 健康狀況比較
    if (answers.health_comparison === 'worse') totalScore += 0;
    else if (answers.health_comparison === 'unknown') totalScore += 0.5;
    else if (answers.health_comparison === 'same') totalScore += 1;
    else if (answers.health_comparison === 'better') totalScore += 2;

    // 17. 臂中圍
    if (answers.mac === 'low') totalScore += 0;
    else if (answers.mac === 'medium') totalScore += 0.5;
    else if (answers.mac === 'high') totalScore += 1;

    // 18. 小腿圍
    if (answers.cc === 'low') totalScore += 0;
    else if (answers.cc === 'high') totalScore += 1;

    return totalScore;
  };

  const determineStatus = (score) => {
    if (score >= 24) return '營養狀況良好';
    if (score >= 17) return '具營養不良危險性';
    return '營養不良';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const totalScore = calculateScore();
      const status = determineStatus(totalScore);
      
      // 如果是匿名，則清空個人資料
      const submissionData = {
        ...formData,
        totalScore,
        status,
        createdAt: new Date().toISOString()
      };

      if (formData.isAnonymous) {
        submissionData.name = '匿名';
        submissionData.gender = 'unknown';
        submissionData.dob = null;
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      setSuccess(true);
      setFormData({
        isAnonymous: true,
        name: '',
        gender: 'male',
        dob: '',
        weight: '',
        height: '',
        kneeHeight: '',
        answers: {
          appetite: '',
          weight_change: '',
          mobility: '',
          stress: '',
          neuro: '',
          bmi: '',
          living: '',
          medication: '',
          pressure_ulcers: '',
          meals: '',
          dairy: '',
          legumes: '',
          meat: '',
          vegetables: '',
          fluid: '',
          feeding_mode: '',
          nutrition_problem: '',
          health_comparison: '',
          mac: '',
          cc: ''
        }
      });
    } catch (error) {
      console.error('提交錯誤:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>MNA 迷你營養評估表</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </Head>

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>MNA 迷你營養評估表</h1>
          <Link href="/statistics" className="btn btn-info">
            查看統計
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            評估表提交成功！
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card mb-4">
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isAnonymous: e.target.checked,
                      // 如果選擇匿名，清空個人資料
                      ...(e.target.checked ? {
                        name: '',
                        gender: 'male',
                        dob: ''
                      } : {})
                    }));
                  }}
                />
                <label className="form-check-label" htmlFor="isAnonymous">
                  我想要匿名填寫（不會記錄姓名、性別和出生日期）
                </label>
              </div>

              <h5 className="card-title">基本資料</h5>
              {!formData.isAnonymous && (
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">姓名</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!formData.isAnonymous}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">性別</label>
                    <select
                      className="form-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required={!formData.isAnonymous}
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">出生日期</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required={!formData.isAnonymous}
                    />
                  </div>
                </div>
              )}
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">體重(公斤)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">身高(公分)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">膝高度(公分)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="kneeHeight"
                    value={formData.kneeHeight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">營養篩檢</h5>
              
              <div className="mb-3">
                <label className="form-label">1. 過去三個月之中，是否因食慾不佳消化問題、咀嚼或吞嚥困難以致進食量越來越少？</label>
                <select
                  className="form-select"
                  name="answers.appetite"
                  value={formData.answers.appetite}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="severe">嚴重食慾不佳 (0分)</option>
                  <option value="moderate">中度食慾不佳 (1分)</option>
                  <option value="none">食慾無變化 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">2. 近三個月體重變化</label>
                <select
                  className="form-select"
                  name="answers.weight_change"
                  value={formData.answers.weight_change}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="severe">體重減輕＞3公斤 (0分)</option>
                  <option value="unknown">不知道 (1分)</option>
                  <option value="moderate">體重減輕1~3公斤 (2分)</option>
                  <option value="none">體重無改變 (3分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">3. 行動力</label>
                <select
                  className="form-select"
                  name="answers.mobility"
                  value={formData.answers.mobility}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="bed">臥床或輪椅 (0分)</option>
                  <option value="limited">可以下床活動或離開輪椅但無法自由走動 (1分)</option>
                  <option value="normal">可以自由走動 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">4. 過去三個月內曾有精神性壓力或急性疾病發作</label>
                <select
                  className="form-select"
                  name="answers.stress"
                  value={formData.answers.stress}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="yes">是 (0分)</option>
                  <option value="no">否 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">5. 神經精神問題</label>
                <select
                  className="form-select"
                  name="answers.neuro"
                  value={formData.answers.neuro}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="severe">嚴重癡呆或抑鬱 (0分)</option>
                  <option value="mild">輕度癡呆 (1分)</option>
                  <option value="none">無精神問題 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">6. 身體質量指數(BMI)</label>
                <select
                  className="form-select"
                  name="answers.bmi"
                  value={formData.answers.bmi}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="low">BMI＜19 (0分)</option>
                  <option value="medium_low">19≦BMI＜21 (1分)</option>
                  <option value="medium_high">21≦BMI＜23 (2分)</option>
                  <option value="high">BMI≧23 (3分)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">一般評估</h5>

              <div className="mb-3">
                <label className="form-label">7. 可以獨立生活 (非住在護理之家或醫院)</label>
                <select
                  className="form-select"
                  name="answers.living"
                  value={formData.answers.living}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="yes">是 (1分)</option>
                  <option value="no">否 (0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">8. 每天需服用三種以上的處方</label>
                <select
                  className="form-select"
                  name="answers.medication"
                  value={formData.answers.medication}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="yes">是 (1分)</option>
                  <option value="no">否 (0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">9. 褥瘡或皮膚潰瘍</label>
                <select
                  className="form-select"
                  name="answers.pressure_ulcers"
                  value={formData.answers.pressure_ulcers}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="yes">是 (1分)</option>
                  <option value="no">否 (0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">10. 一天中可以吃幾餐完整的餐食</label>
                <select
                  className="form-select"
                  name="answers.meals"
                  value={formData.answers.meals}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="one">1餐 (0分)</option>
                  <option value="two">2餐 (1分)</option>
                  <option value="three">3餐 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">11. 蛋白質攝取量</label>
                <div className="mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="answers.dairy"
                      checked={formData.answers.dairy === 'yes'}
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'answers.dairy',
                          value: e.target.checked ? 'yes' : 'no'
                        }
                      })}
                    />
                    <label className="form-check-label">
                      每天至少攝取一份乳製品(牛奶、乳酪、優酪乳)
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="answers.legumes"
                      checked={formData.answers.legumes === 'yes'}
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'answers.legumes',
                          value: e.target.checked ? 'yes' : 'no'
                        }
                      })}
                    />
                    <label className="form-check-label">
                      每周攝取兩份以上的豆類或蛋類
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="answers.meat"
                      checked={formData.answers.meat === 'yes'}
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'answers.meat',
                          value: e.target.checked ? 'yes' : 'no'
                        }
                      })}
                    />
                    <label className="form-check-label">
                      每天均吃些肉、魚、雞、鴨類
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">12. 每天至少攝取二份或二份以上的蔬菜或水果</label>
                <select
                  className="form-select"
                  name="answers.vegetables"
                  value={formData.answers.vegetables}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="yes">是 (1分)</option>
                  <option value="no">否 (0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">13. 每天攝取多少液體(包括白開水、果汁、咖啡、茶、牛奶)</label>
                <select
                  className="form-select"
                  name="answers.fluid"
                  value={formData.answers.fluid}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="low">少於3杯 (0分)</option>
                  <option value="medium">3－5杯 (0.5分)</option>
                  <option value="high">大於5杯 (1.0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">14. 進食的形式</label>
                <select
                  className="form-select"
                  name="answers.feeding_mode"
                  value={formData.answers.feeding_mode}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="assisted">無人協助則無法進食 (0分)</option>
                  <option value="difficult">可以自己進食但較吃力 (1分)</option>
                  <option value="independent">可以自己進食 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">15. 他們覺得自己營養方面有沒有問題？</label>
                <select
                  className="form-select"
                  name="answers.nutrition_problem"
                  value={formData.answers.nutrition_problem}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="severe">覺得自己營養非常不好 (0分)</option>
                  <option value="mild">不太清楚或營養不太好 (1分)</option>
                  <option value="none">覺得自己沒有營養問題 (2分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">16. 與其他同年齡的人比較，他們認為自己的健康狀況如何？</label>
                <select
                  className="form-select"
                  name="answers.health_comparison"
                  value={formData.answers.health_comparison}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="worse">不如同年齡的人 (0分)</option>
                  <option value="unknown">不知道 (0.5分)</option>
                  <option value="same">和同年齡的人差不多 (1.0分)</option>
                  <option value="better">比同年齡的人好 (2.0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">17. 臂中圍MAC(公分)</label>
                <select
                  className="form-select"
                  name="answers.mac"
                  value={formData.answers.mac}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="low">MAC＜21 (0分)</option>
                  <option value="medium">MAC21-21.9 (0.5分)</option>
                  <option value="high">MAC≧22 (1.0分)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">18. 小腿圍C.C.(公分)</label>
                <select
                  className="form-select"
                  name="answers.cc"
                  value={formData.answers.cc}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">請選擇</option>
                  <option value="low">C.C.＜31 (0分)</option>
                  <option value="high">C.C.≧31 (1分)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '提交中...' : '提交評估表'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 