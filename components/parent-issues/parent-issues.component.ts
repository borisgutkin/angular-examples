import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BreadcrumbsService} from '../../../services/breadcrumbs.service';
import {DialogService} from '../../../services/dialog.service';
import {TemplateService} from '../../../services/template.service';
import {ProjectService} from '../../../services/project.service';
import {ParentIssueService} from '../../../services/parent-issue.service';
import {ApiService} from '../../../services/api.service';
import {Template} from '../../../models/template';

@Component({
    selector: 'app-parent-issues',
    templateUrl: './parent-issues.component.html',
    styleUrls: ['./parent-issues.component.css']
})

export class ParentIssuesComponent implements OnInit {

    public templateId: number;
    public template: Template = {} as any;
    public templateModel: Template = {} as any;
    public templateChanged = false;
    public confirmed = false;
    public parentIssues = [];
    public templateProjects = [];
    public projects = [];
    public templateChangedEnabled: false;
    public issueTypes = [];  
    public loaderTemplate;
    public loaderParentIssues;
    public loaderTemplateProjects;
    public addingProject;
    public changingTemplate =false;
    public selectedProject;
    public selectedIssue;
    public templateEnabledChanged = false;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private apiService: ApiService,
                private breadcrumbsService: BreadcrumbsService,
                public dialogService: DialogService,
                private templateService: TemplateService,
                private projectService: ProjectService,
                private parentIssueService: ParentIssueService) {
    }

    ngOnInit() {
        this.loaderTemplate = true;
        this.loaderParentIssues = true;
        this.loaderTemplateProjects = true;
        this.dialogService.prompt.subscribe( state => this.confirmed = state);
        this.route.params.subscribe((params) => {
            if (params.id) {
                this.templateId = params.id;
                this.loadTemplate();
                this.loadParentIssues();
                this.loadProjects();
            }
        });
    }

    loadTemplate() {
        this.templateService.getTemplateById(this.templateId).subscribe(results => {
            this.template.template_name = results.template.template_name;
            this.template.enabled = results.template.enabled;
            this.templateModel.template_name = results.template.template_name;
            this.templateModel.enabled = results.template.enabled;
            this.breadcrumbsService.templateData.emit(this.template);
            this.loaderTemplate = false;
            sessionStorage.setItem('template', JSON.stringify(results.template));
        });
    }

    templateNameChange(value) {
        this.templateChanged = (value !== this.template.template_name);
    }

    toggleEnabled(status) {
       this.templateModel.enabled = status ? 1 : 0;
        this.templateEnabledChanged = (this.templateModel.enabled !== this.template.enabled);
    }

    updateTemplate() {
        this.changingTemplate = true;
        this.templateService.updateTemplate(this.templateId, this.templateModel).subscribe(results => {
            if (results.success) {
                this.dialogService.flag(results.message, 'success');
                this.template = results.template;
                this.templateChanged = false;
                this.templateEnabledChanged = false;
                this.breadcrumbsService.templateData.emit(this.template);
                sessionStorage.setItem('template', JSON.stringify(results.template));
                this.changingTemplate = false;
            }
        });
    }

    resetTemplate() {
        this.templateModel.template_name = this.template.template_name;
        this.templateModel.enabled = this.template.enabled;
        this.templateChanged = false;
        this.templateEnabledChanged = false;
    }

    loadParentIssues() {
        this.parentIssueService.getParentIssues(this.templateId).subscribe((results) => {
            if (results.success) {
                this.parentIssues = results.parentIssues;
                this.loaderParentIssues = false;
                if (this.parentIssues) {
                    this.loadIssueTypes();
                }
            }
        });
    }

    createParentIssue() {
        this.dialogService.checkState(null, (state) => {
            if (state || !this.templateChanged) {
                this.parentIssueService.createParentIssue(this.templateId).subscribe(results => {
                    if (results.success) {
                        this.dialogService.flag(results.message, 'success');
                        this.validateProjects({ parentIssue: results.parentIssue.issue_type });
                        this.router.navigate([this.router.url + '/' + results.parentIssue.id + '/children']);
                    }
                });
            }
        });
    }

    deleteParentIssue(parentIssueId: number) {
        const message = 'Are you sure you wish to delete this parent issue?';
        const confirm = this.dialogService.confirm(message).subscribe(confirmed => {
            if (confirmed) {
                this.selectedIssue = parentIssueId;
                this.parentIssueService.deleteParentIssue(parentIssueId).subscribe(results => {
                    if (results.success) {
                        this.dialogService.flag(results.message, 'success');
                        this.selectedIssue = null;
                        this.parentIssues = this.parentIssues.filter(pi => pi.id !== parentIssueId);
                        this.loadProjects();
                    }
                });
            } else {
                confirm.unsubscribe();
            }
        });
    }

    loadProjects() {
        return this.projectService.loadProjects(this.templateId).subscribe(results => {
            if (results.success) {
                this.projects = results.projects;
                this.templateProjects = results.templateProjects;
                this.loaderTemplateProjects = false;
                this.filterApiProjects();
                this.validateProjects();
            }
        });
    }

    validateProjects(data?: any) {
        this.projectService.validateProjectIssues(this.templateId, data).subscribe(issues => {
            if (issues.length) {
                this.templateProjects.map(tp => {
                    const missingIssues = issues.find(issue => issue.key === tp.key);
                    if (missingIssues) {
                        tp['missingIssues'] = missingIssues.missingIssues.issues;
                        tp['missingIssues'] = tp.missingIssues.concat(missingIssues.missingIssues.subtasks);
                    }
                });
            }
        });
    }

    addProject(selectedProject) {
        this.addingProject = true;
        if (selectedProject.value === '0') {
            this.dialogService.message('Please select project');
            this.addingProject = false;
            return false;
        }

        const options = selectedProject.options;
        const projectData = {
            key: selectedProject.value,
            name: options[options.selectedIndex].text
        };

        this.projectService.addProject(this.templateId, projectData).subscribe(results => {
            if (results.success) {
                this.dialogService.flag(results.message, 'success');
                this.templateProjects.push(results.project);
                this.projects.splice((options.selectedIndex - 1), 1);
                this.validateProjects({ project: results.project.key });
                this.addingProject = false;
            }
        });
    }

    deleteProject(id: number) {
        const message = 'Are you sure you wish to remove this project?';
        const confirm = this.dialogService.confirm(message).subscribe(confirmed => {
            if (confirmed) {
                this.selectedProject = id;
                this.projectService.deleteProject(id).subscribe(results => {
                    if (results.success) {
                        this.dialogService.flag(results.message, 'success');
                        this.selectedProject = null;
                        const deletedProject = this.templateProjects.find(project => project.id === id);
                        this.projects.push(deletedProject);
                        this.templateProjects = this.templateProjects.filter(project => project.id !== id);
                    }
                });
            } else {
                confirm.unsubscribe();
            }
        });
    }

    filterApiProjects() {
        let projects = this.projects;
        projects = projects.filter(project => {
            return !this.templateProjects.find(tp => tp.key === project.key);
        });
        this.projects = projects;
    }

    loadIssueTypes() {
        this.apiService.getIssueTypes().subscribe(results => {
            if (results.success) {
                this.issueTypes = results.issueTypes;
            }
        });
    }
    toggleSaveButton(){
        let toggle = true;
        if ((this.templateChanged || this.templateEnabledChanged) && !this.changingTemplate ){
            toggle = false;
        } else {
            toggle = true;
        }
        return toggle;
    }
}