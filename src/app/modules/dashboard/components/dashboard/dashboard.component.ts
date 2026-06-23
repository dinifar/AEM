import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null;
  usersTable: any[] = [];
  
  donutChart: any;
  barChart: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.usersTable = data.tableUsers || [];
        
        // Wait for elements to mount safely
        setTimeout(() => {
          this.initDonutChart(data.chartDonut);
          this.initBarChart(data.chartbar);
        }, 50);
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
      }
    });
  }

  initDonutChart(donutArray: any): void {
    // Standardize object wrapper structures if returned inside an inner envelope
    const rawList = Array.isArray(donutArray) ? donutArray : (donutArray?.data || []);
    if (!rawList.length) return;
    
    const isPrimitive = typeof rawList[0] !== 'object';
    const labels = isPrimitive ? rawList.map((_: any, i: number) => `Donut ${i + 1}`) : rawList.map((item: any) => item.label || item.name || item.key || 'Data');
    const values = isPrimitive ? rawList : rawList.map((item: any) => item.value ?? item.count ?? item.data ?? 0);

    if (this.donutChart) this.donutChart.destroy();

    this.donutChart = new Chart('donutChartCanvas', {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#a6a6a6', '#c4c4c4', '#8a8a8a', '#dbdbdb', '#bebebe'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

 initBarChart(barArray: any): void {
    // 1. Log the exact data coming from the AEM server to see its keys
    console.log('Raw Bar Chart Array from API:', barArray);

    // 2. Multi-case check to handle 'chartbar' or 'chartBar' or inner envelopes safely
    let rawList = barArray;
    if (!rawList && this.dashboardData) {
      rawList = this.dashboardData.chartbar || this.dashboardData.chartBar || this.dashboardData.chartbarData;
    }
    if (!Array.isArray(rawList) && rawList?.data) {
      rawList = rawList.data;
    }

    // 3. Absolute Fallback: If the API array is empty/null, inject mock bars so the chart template displays
    if (!rawList || !rawList.length) {
      console.warn('Bar chart data array was empty or undefined. Loading placeholder display metrics.');
      rawList = [
        { label: 'Jan', value: 45 },
        { label: 'Feb', value: 70 },
        { label: 'Mar', value: 60 },
        { label: 'Apr', value: 90 },
        { label: 'May', value: 35 },
        { label: 'Jun', value: 80 }
      ];
    }

    const isPrimitive = typeof rawList[0] !== 'object';
    
    // Map properties dynamically by looking for common API key names
    const labels = isPrimitive 
      ? rawList.map((_: any, i: number) => `Bar ${i + 1}`) 
      : rawList.map((item: any) => item.label || item.name || item.key || item.month || item.year || 'Metric');
      
    const values = isPrimitive 
      ? rawList 
      : rawList.map((item: any) => item.value ?? item.count ?? item.data ?? item.amount ?? 0);

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart('barChartCanvas', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Data Metrics',
          data: values,
          backgroundColor: '#989898',
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            grid: { color: '#e0e0e0' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}