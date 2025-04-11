import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

export default function Statistics() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    statusDistribution: {},
    ageDistribution: {},
    genderDistribution: {},
    bmiDistribution: {},
    itemScores: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  async function fetchStatistics() {
    try {
      const response = await fetch('/api/assessments');
      const assessments = await response.json();
      
      if (!Array.isArray(assessments)) {
        throw new Error('Invalid data format');
      }

      // 基本統計
      const totalAssessments = assessments.length;
      const totalScore = assessments.reduce((sum, assessment) => sum + (assessment.totalScore || 0), 0);
      const averageScore = totalAssessments > 0 ? (totalScore / totalAssessments).toFixed(2) : 0;

      // 營養狀況分布
      const statusDistribution = assessments.reduce((acc, assessment) => {
        const status = assessment.status || '未知';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // 性別分布（排除匿名數據）
      const genderDistribution = assessments.reduce((acc, assessment) => {
        if (assessment.gender === 'unknown') {
          acc['未提供'] = (acc['未提供'] || 0) + 1;
        } else {
          const gender = assessment.gender === 'male' ? '男性' : '女性';
          acc[gender] = (acc[gender] || 0) + 1;
        }
        return acc;
      }, {});

      // 年齡分布（排除匿名數據）
      const ageDistribution = assessments.reduce((acc, assessment) => {
        if (assessment.dob) {
          const birthDate = new Date(assessment.dob);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const ageGroup = Math.floor(age / 10) * 10;
          const key = `${ageGroup}-${ageGroup + 9}歲`;
          acc[key] = (acc[key] || 0) + 1;
        } else {
          acc['未提供'] = (acc['未提供'] || 0) + 1;
        }
        return acc;
      }, {});

      // BMI 分布
      const bmiDistribution = assessments.reduce((acc, assessment) => {
        const height = parseFloat(assessment.height) / 100; // 轉換為米
        const weight = parseFloat(assessment.weight);
        if (height && weight) {
          const bmi = weight / (height * height);
          if (bmi < 18.5) acc['過輕'] = (acc['過輕'] || 0) + 1;
          else if (bmi < 24) acc['正常'] = (acc['正常'] || 0) + 1;
          else if (bmi < 27) acc['過重'] = (acc['過重'] || 0) + 1;
          else acc['肥胖'] = (acc['肥胖'] || 0) + 1;
        } else {
          acc['資料不完整'] = (acc['資料不完整'] || 0) + 1;
        }
        return acc;
      }, {});

      // 各項評估項目平均得分
      const itemScores = {
        appetite: 0,
        weight_change: 0,
        mobility: 0,
        stress: 0,
        neuro: 0,
        bmi: 0,
        living: 0,
        medication: 0,
        pressure_ulcers: 0,
        meals: 0,
        protein: 0,
        vegetables: 0,
        fluid: 0,
        feeding_mode: 0,
        nutrition_problem: 0,
        health_comparison: 0,
        mac: 0,
        cc: 0
      };

      assessments.forEach(assessment => {
        Object.keys(itemScores).forEach(key => {
          if (assessment.answers && assessment.answers[key]) {
            itemScores[key] += calculateItemScore(key, assessment.answers[key]);
          }
        });
      });

      Object.keys(itemScores).forEach(key => {
        itemScores[key] = totalAssessments > 0 ? 
          (itemScores[key] / totalAssessments).toFixed(2) : 0;
      });

      setStats({
        totalAssessments,
        averageScore,
        statusDistribution,
        genderDistribution,
        ageDistribution,
        bmiDistribution,
        itemScores,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: '獲取數據失敗'
      }));
    }
  }

  function calculateItemScore(key, value) {
    // 根據不同項目計算分數
    switch (key) {
      case 'appetite':
        return value === 'severe' ? 0 : value === 'moderate' ? 1 : 2;
      case 'weight_change':
        return value === 'severe' ? 0 : value === 'unknown' ? 1 : 
               value === 'moderate' ? 2 : 3;
      case 'mobility':
        return value === 'bed' ? 0 : value === 'limited' ? 1 : 2;
      case 'stress':
        return value === 'yes' ? 0 : 2;
      case 'neuro':
        return value === 'severe' ? 0 : value === 'mild' ? 1 : 2;
      case 'bmi':
        return value === 'low' ? 0 : value === 'medium_low' ? 1 :
               value === 'medium_high' ? 2 : 3;
      case 'living':
      case 'medication':
      case 'pressure_ulcers':
        return value === 'yes' ? 1 : 0;
      case 'meals':
        return value === 'one' ? 0 : value === 'two' ? 1 : 2;
      case 'protein':
        return value === 'yes' ? 1 : 0;
      case 'vegetables':
        return value === 'yes' ? 1 : 0;
      case 'fluid':
        return value === 'low' ? 0 : value === 'medium' ? 0.5 : 1;
      case 'feeding_mode':
        return value === 'assisted' ? 0 : value === 'difficult' ? 1 : 2;
      case 'nutrition_problem':
        return value === 'severe' ? 0 : value === 'mild' ? 1 : 2;
      case 'health_comparison':
        return value === 'worse' ? 0 : value === 'unknown' ? 0.5 :
               value === 'same' ? 1 : 2;
      case 'mac':
        return value === 'low' ? 0 : value === 'medium' ? 0.5 : 1;
      case 'cc':
        return value === 'low' ? 0 : 1;
      default:
        return 0;
    }
  }

  async function exportToExcel() {
    const exportButton = document.getElementById('exportButton');
    exportButton.disabled = true;
    exportButton.textContent = '匯出中...';
    
    try {
      const checkResponse = await fetch('/api/assessments');
      if (!checkResponse.ok) {
        throw new Error(`檢查數據時發生錯誤: ${checkResponse.status} ${checkResponse.statusText}`);
      }
      
      const assessments = await checkResponse.json();
      if (!Array.isArray(assessments) || assessments.length === 0) {
        alert('沒有可匯出的數據');
        return;
      }
      
      const exportResponse = await fetch('/api/assessments?export=true');
      if (!exportResponse.ok) {
        const errorData = await exportResponse.json();
        throw new Error(`匯出失敗: ${errorData.message || exportResponse.statusText}`);
      }
      
      const blob = await exportResponse.blob();
      if (blob.size === 0) {
        throw new Error('匯出的文件為空');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mna-assessment-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('匯出成功！');
    } catch (error) {
      console.error('匯出錯誤:', error);
      alert(`匯出失敗: ${error.message}`);
    } finally {
      exportButton.disabled = false;
      exportButton.textContent = '匯出 Excel';
    }
  }

  const statusChartData = {
    labels: Object.keys(stats.statusDistribution),
    datasets: [
      {
        data: Object.values(stats.statusDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ]
      }
    ]
  };

  const genderChartData = {
    labels: Object.keys(stats.genderDistribution),
    datasets: [
      {
        data: Object.values(stats.genderDistribution),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ]
      }
    ]
  };

  const ageChartData = {
    labels: Object.keys(stats.ageDistribution),
    datasets: [
      {
        label: '人數',
        data: Object.values(stats.ageDistribution),
        backgroundColor: 'rgba(75, 192, 192, 0.8)'
      }
    ]
  };

  const bmiChartData = {
    labels: Object.keys(stats.bmiDistribution),
    datasets: [
      {
        label: '人數',
        data: Object.values(stats.bmiDistribution),
        backgroundColor: 'rgba(153, 102, 255, 0.8)'
      }
    ]
  };

  const itemLabels = {
    appetite: '食慾',
    weight_change: '體重變化',
    mobility: '行動力',
    stress: '精神壓力',
    neuro: '神經精神',
    bmi: 'BMI',
    living: '獨立生活',
    medication: '處方藥',
    pressure_ulcers: '褥瘡',
    meals: '餐食',
    protein: '蛋白質',
    vegetables: '蔬果',
    fluid: '液體',
    feeding_mode: '進食形式',
    nutrition_problem: '營養問題',
    health_comparison: '健康比較',
    mac: '臂圍',
    cc: '小腿圍'
  };

  const radarChartData = {
    labels: Object.keys(stats.itemScores).map(key => itemLabels[key]),
    datasets: [
      {
        label: '平均得分',
        data: Object.values(stats.itemScores),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
      }
    ]
  };

  return (
    <>
      <Head>
        <title>MNA 評估統計 - 迷你營養評估表</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </Head>

      <div className="container mt-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>MNA 評估統計</h1>
          <Link href="/">
            <a style={{ textDecoration: 'none', color: '#0070f3' }}>返回首頁</a>
          </Link>
        </div>
        
        {stats.loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
          </div>
        ) : stats.error ? (
          <div className="alert alert-danger">{stats.error}</div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">總評估數</h5>
                    <p className="card-text display-4">{stats.totalAssessments}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">平均分數</h5>
                    <p className="card-text display-4">{stats.averageScore}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">營養狀況分布</h5>
                    <Pie data={statusChartData} options={{ responsive: true }} />
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">性別分布</h5>
                    <Pie data={genderChartData} options={{ responsive: true }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">年齡分布</h5>
                    <Bar 
                      data={ageChartData} 
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">BMI 分布</h5>
                    <Bar 
                      data={bmiChartData} 
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">各項評估平均得分</h5>
                <Radar 
                  data={radarChartData} 
                  options={{
                    responsive: true,
                    scales: {
                      r: {
                        beginAtZero: true,
                        min: 0,
                        max: 3,
                        ticks: {
                          stepSize: 0.5
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">詳細數據</h5>
                <div className="alert alert-info">
                  註：部分統計資料可能包含匿名提交的數據，個人資訊（如性別、年齡）統計僅計入有提供資料的評估。
                </div>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>狀況</th>
                        <th>人數</th>
                        <th>百分比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.statusDistribution).map(([status, count]) => (
                        <tr key={status}>
                          <td>{status}</td>
                          <td>{count}</td>
                          <td>{((count / stats.totalAssessments) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="text-center mb-5">
              <button
                id="exportButton"
                className="btn btn-primary"
                onClick={exportToExcel}
              >
                匯出 Excel
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
} 