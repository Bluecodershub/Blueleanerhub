@{
    # PSScriptAnalyzer Settings for BluelearnerHub Platform Scripts
    # This file configures the PowerShell Script Analyzer rules
    
    # Severity levels: Error, Warning, Information
    Severity = @('Error', 'Warning')
    
    # Include default rules
    IncludeDefaultRules = $true
    
    # Exclude specific rules that cause false positives
    ExcludeRules = @(
        'PSAvoidUsingWriteHost'  # We use Write-Host for colored output in scripts
    )
    
    # Rule-specific settings
    Rules = @{
        PSUseApprovedVerbs = @{
            Enable = $true
        }
        PSAvoidUsingCmdletAliases = @{
            Enable = $true
        }
        PSUseDeclaredVarsMoreThanAssignments = @{
            Enable = $true
        }
    }
}
