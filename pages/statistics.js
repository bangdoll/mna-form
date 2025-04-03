import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Statistics() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    statusDistribution: {},
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

      // 計算統計數據
      const totalAssessments = assessments.length;
      const totalScore = assessments.reduce((sum, assessment) => sum + (assessment.totalScore || 0), 0);
      const averageScore = totalAssessments > 0 ? (totalScore / totalAssessments).toFixed(2) : 0;

      // 計算營養狀況分佈
      const statusDistribution = assessments.reduce((acc, assessment) => {
        const status = assessment.status || '未知';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalAssessments,
        averageScore,
        statusDistribution,
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

  async function exportToExcel() {
    const exportButton = document.getElementById('exportButton');
    exportButton.disabled = true;
    exportButton.textContent = '匯出中...';
    
    try {
      console.log('開始匯出流程...');
      
      // 首先檢查是否有數據
      const checkResponse = await fetch('/api/assessments');
      if (!checkResponse.ok) {
        throw new Error(`檢查數據時發生錯誤: ${checkResponse.status} ${checkResponse.statusText}`);
      }
      
      const assessments = await checkResponse.json();
      console.log(`找到 ${assessments.length} 筆評估數據`);
      
      if (!Array.isArray(assessments) || assessments.length === 0) {
        alert('沒有可匯出的數據');
        return;
      }
      
      // 執行匯出
      console.log('開始下載 CSV...');
      const exportResponse = await fetch('/api/assessments?export=true');
      console.log('Content-Type:', exportResponse.headers.get('Content-Type'));
      console.log('Content-Disposition:', exportResponse.headers.get('Content-Disposition'));
      
      if (!exportResponse.ok) {
        const errorData = await exportResponse.json();
        throw new Error(`匯出失敗: ${errorData.message || exportResponse.statusText}`);
      }
      
      // 檢查響應內容
      const blob = await exportResponse.blob();
      console.log('下載的文件大小:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('匯出的文件為空');
      }
      
      // 創建下載鏈接
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

  return (
    <>
      <Head>
        <title>MNA 評估統計 - 迷你營養評估表</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </Head>

      <div className="container mt-5">
        <h1 className="mb-4">MNA 評估統計</h1>
        
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

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">營養狀況分布</h5>
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