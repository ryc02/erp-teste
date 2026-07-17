/**
 * UX Telemetry Module
 * Responsável por capturar métricas de UX (Time-on-task, Task completion rate, Error frequency, etc.)
 * e armazenar logs no localStorage para análise durante a fase de validação (beta testing).
 */

const UXTelemetry = (function() {
    const SESSION_KEY = 'venner_ux_telemetry';
    
    // In-memory state for active tasks to calculate duration
    const activeTasks = {};

    function _getLogs() {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function _saveLog(logEntry) {
        try {
            const logs = _getLogs();
            logs.push({
                timestamp: new Date().toISOString(),
                path: window.location.hash || window.location.pathname,
                ...logEntry
            });
            
            // Keep only the last 1000 logs to prevent localStorage overflow
            if (logs.length > 1000) {
                logs.shift();
            }
            
            localStorage.setItem(SESSION_KEY, JSON.stringify(logs));
            
            // Debug only: log to console if not in prod
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.debug('[UX Telemetry]', logEntry.type, logEntry);
            }
        } catch (e) {
            console.warn('Erro ao salvar métrica de UX', e);
        }
    }

    return {
        /**
         * Registra o início de uma tarefa/fluxo.
         * @param {string} taskId - Identificador único da tarefa (ex: 'vendas_novo_pedido')
         */
        startTask(taskId) {
            activeTasks[taskId] = {
                startTime: performance.now(),
                steps: 0
            };
            _saveLog({ type: 'TASK_START', taskId });
        },

        /**
         * Registra um passo ou interação dentro de uma tarefa ativa.
         * @param {string} taskId 
         * @param {string} stepName 
         */
        trackStep(taskId, stepName) {
            if (activeTasks[taskId]) {
                activeTasks[taskId].steps += 1;
            }
            _saveLog({ type: 'TASK_STEP', taskId, stepName });
        },

        /**
         * Registra a conclusão com sucesso de uma tarefa.
         * @param {string} taskId 
         */
        completeTask(taskId) {
            const task = activeTasks[taskId];
            let durationMs = -1;
            let totalSteps = 0;

            if (task) {
                durationMs = Math.round(performance.now() - task.startTime);
                totalSteps = task.steps;
                delete activeTasks[taskId];
            }

            _saveLog({ 
                type: 'TASK_COMPLETE', 
                taskId, 
                durationMs, 
                totalSteps,
                timeOnTaskSeconds: Math.round(durationMs / 1000)
            });
        },

        /**
         * Registra o abandono/falha (Drop-off) de uma tarefa.
         * @param {string} taskId 
         * @param {string} reason - Ex: 'fechou_modal', 'erro_validacao'
         */
        dropTask(taskId, reason = 'unknown') {
            const task = activeTasks[taskId];
            let durationMs = -1;
            
            if (task) {
                durationMs = Math.round(performance.now() - task.startTime);
                delete activeTasks[taskId];
            }

            _saveLog({ 
                type: 'TASK_DROP_OFF', 
                taskId, 
                reason,
                durationMs 
            });
        },

        /**
         * Registra erros de UX (ex: validações falhas, retornos de API).
         * @param {string} errorType - Ex: 'API_ERROR', 'FORM_VALIDATION'
         * @param {string} message 
         * @param {Object} details 
         */
        trackError(errorType, message, details = {}) {
            _saveLog({
                type: 'ERROR',
                errorType,
                message,
                details
            });
        },

        /**
         * Registra eventos genéricos importantes (Edge Cases).
         * @param {string} eventName 
         * @param {Object} context 
         */
        trackEvent(eventName, context = {}) {
            _saveLog({
                type: 'EVENT',
                eventName,
                context
            });
        },

        /**
         * Exporta os logs gravados.
         */
        exportLogs() {
            return _getLogs();
        },

        /**
         * Limpa os logs locais.
         */
        clearLogs() {
            localStorage.removeItem(SESSION_KEY);
        }
    };
})();

// Export globally
window.UXTelemetry = UXTelemetry;
