import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    dob: '',
    answers: {
      appetite: '',
      weight_change: '',
      mobility: '',
      medication: '',
      pressure_ulcers: '',
      meals: '',
      dairy: '',
      protein: '',
      fruits_vegetables: '',
      fluid: '',
      feeding_mode: '',
      self_assessment: '',
      health_comparison: '',
      ac: '',
      cc: ''
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

    // A. 食慾減退
    if (answers.appetite === 'severe') totalScore += 0;
    else if (answers.appetite === 'moderate') totalScore += 1;
    else if (answers.appetite === 'none') totalScore += 2;

    // B. 體重減輕
    if (answers.weight_change === 'severe') totalScore += 0;
    else if (answers.weight_change === 'moderate') totalScore += 2;
    else if (answers.weight_change === 'none') totalScore += 3;

    // C. 活動能力
    if (answers.mobility === 'bed') totalScore += 0;
    else if (answers.mobility === 'indoor') totalScore += 1;
    else if (answers.mobility === 'outdoor') totalScore += 2;

    // D. 精神壓力或急性疾病
    if (answers.medication === 'yes') totalScore += 0;
    else if (answers.medication === 'no') totalScore += 2;

    // E. 神經心理問題
    if (answers.pressure_ulcers === 'severe') totalScore += 0;
    else if (answers.pressure_ulcers === 'moderate') totalScore += 1;
    else if (answers.pressure_ulcers === 'none') totalScore += 2;

    // F. BMI
    const ac = parseFloat(answers.ac);
    const cc = parseFloat(answers.cc);
    if (ac < 21) totalScore += 0;
    else if (ac <= 22) totalScore += 0.5;
    else totalScore += 1;

    if (cc < 31) totalScore += 0;
    else totalScore += 1;

    return totalScore;
  };

  const determineStatus = (score) => {
    if (score >= 12) return '營養狀況良好';
    if (score >= 8) return '可能有營養不良的風險';
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
      
      const assessmentData = {
        ...formData,
        totalScore,
        status,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        throw new Error('提交失敗');
      }

      setSuccess(true);
      setFormData({
        name: '',
        gender: 'male',
        dob: '',
        answers: {
          appetite: '',
          weight_change: '',
          mobility: '',
          medication: '',
          pressure_ulcers: '',
          meals: '',
          dairy: '',
          protein: '',
          fruits_vegetables: '',
          fluid: '',
          feeding_mode: '',
          self_assessment: '',
          health_comparison: '',
          ac: '',
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
              <h5 className="card-title">基本資料</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">姓名</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">性別</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
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
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">評估項目</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">A. 近三個月食慾是否減退？</label>
                  <select
                    className="form-select"
                    name="answers.appetite"
                    value={formData.answers.appetite}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">請選擇</option>
                    <option value="severe">嚴重食慾減退</option>
                    <option value="moderate">中度食慾減退</option>
                    <option value="none">沒有食慾減退</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">B. 近三個月體重減輕情況</label>
                  <select
                    className="form-select"
                    name="answers.weight_change"
                    value={formData.answers.weight_change}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">請選擇</option>
                    <option value="severe">減輕超過3公斤</option>
                    <option value="moderate">不知道</option>
                    <option value="none">減輕1-3公斤</option>
                    <option value="gain">沒有減輕</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">C. 活動能力</label>
                  <select
                    className="form-select"
                    name="answers.mobility"
                    value={formData.answers.mobility}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">請選擇</option>
                    <option value="bed">臥床或輪椅</option>
                    <option value="indoor">可以下床/離開輪椅，但不能外出</option>
                    <option value="outdoor">可以外出</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">D. 近三個月是否有精神壓力或急性疾病？</label>
                  <select
                    className="form-select"
                    name="answers.medication"
                    value={formData.answers.medication}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">請選擇</option>
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">E. 神經心理問題</label>
                  <select
                    className="form-select"
                    name="answers.pressure_ulcers"
                    value={formData.answers.pressure_ulcers}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">請選擇</option>
                    <option value="severe">嚴重失智或憂鬱</option>
                    <option value="moderate">輕度失智</option>
                    <option value="none">無心理問題</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">上臂中點圍(AC)（公分）</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    name="answers.ac"
                    value={formData.answers.ac}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">小腿圍(CC)（公分）</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    name="answers.cc"
                    value={formData.answers.cc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-5">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '提交中...' : '提交評估'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 