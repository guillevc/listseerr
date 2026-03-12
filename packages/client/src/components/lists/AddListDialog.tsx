import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useAddListForm } from '../../hooks/use-add-list-form';
import { StepProviderSelection, StepListConfiguration } from './add-list';

export function AddListDialog() {
  const {
    state,
    effectiveName,
    isCreating,
    isProviderConfigured,
    handleNameChange,
    handleMaxItemsChange,
    handleMediaTypeChange,
    handleChartTypeChange,
    handleAnilistStatusChange,
    handleSeerrUserIdOverrideChange,
    handleUrlChange,
    handleAnilistUsernameChange,
    handleProviderChange,
    handleOpenChange,
    goToStep2,
    goToStep1,
    handleAdd,
    getProviderName,
  } = useAddListForm();

  return (
    <Dialog open={state.open} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {/* Dialog Header - Always Visible */}
        <DialogHeader>
          <DialogTitle>Add New List</DialogTitle>
          <DialogDescription>
            {state.currentStep === 1
              ? 'Select a provider'
              : `Configure ${getProviderName(state.provider)} list`}
          </DialogDescription>
        </DialogHeader>

        {/* Animated Progress Bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-card">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: state.currentStep === 1 ? (state.progressAnimated ? '50%' : '0%') : '100%',
            }}
          ></div>
        </div>

        {/* STEP 1: Provider Selection */}
        {state.currentStep === 1 && (
          <StepProviderSelection
            provider={state.provider}
            onProviderChange={handleProviderChange}
            isProviderConfigured={isProviderConfigured}
            onContinue={goToStep2}
          />
        )}

        {/* STEP 2: Configure Details */}
        {state.currentStep === 2 && (
          <StepListConfiguration
            provider={state.provider}
            name={effectiveName}
            onNameChange={handleNameChange}
            url={state.url}
            onUrlChange={handleUrlChange}
            urlError={state.urlError}
            maxItems={state.maxItems}
            onMaxItemsChange={handleMaxItemsChange}
            selectedMediaType={state.selectedMediaType}
            onMediaTypeChange={handleMediaTypeChange}
            selectedChartType={state.selectedChartType}
            onChartTypeChange={handleChartTypeChange}
            anilistUsername={state.anilistUsername}
            onAnilistUsernameChange={handleAnilistUsernameChange}
            anilistUsernameError={state.anilistUsernameError}
            anilistStatus={state.anilistStatus}
            onAnilistStatusChange={handleAnilistStatusChange}
            seerrUserIdOverride={state.seerrUserIdOverride}
            onSeerrUserIdOverrideChange={handleSeerrUserIdOverrideChange}
            onBack={goToStep1}
            onSubmit={handleAdd}
            isLoading={isCreating}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
