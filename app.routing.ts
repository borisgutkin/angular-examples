import { RouterModule, Routes } from '@angular/router';
import { PromptGuard } from './guards/prompt.guard';

// components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TemplatesComponent } from './components/templates/templates/templates.component';
import { ParentIssuesComponent } from './components/templates/parent-issues/parent-issues.component';
import { ChildIssuesComponent } from './components/templates/child-issues/child-issues.component';
import { ChildIssueFormComponent } from './components/templates/child-issue-form/child-issue-form.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { ExecutionLogsComponent } from './components/execution-logs/execution-logs.component';

// routing
const appRoutes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'templates', component: TemplatesComponent},
    { path: 'templates/:id/parent-issues',
        component: ParentIssuesComponent,
        canDeactivate: [PromptGuard] },
    { path: 'templates/:template_id/parent-issues/:id/children',
        component: ChildIssuesComponent,
        canDeactivate: [PromptGuard] },
    { path: 'templates/:template_id/parent-issues/:parent_issue_id/children/create',
        component: ChildIssueFormComponent,
        canDeactivate: [PromptGuard]
    },
    { path: 'templates/:template_id/parent-issues/:parent_issue_id/children/edit/:id',
        component: ChildIssueFormComponent,
        canDeactivate: [PromptGuard] },
    { path: 'configuration', component: ConfigurationComponent },
    { path: 'logs', component: ExecutionLogsComponent },
    { path: '**', component: PageNotFoundComponent }
];

export const AppRouting = RouterModule.forRoot(appRoutes);
