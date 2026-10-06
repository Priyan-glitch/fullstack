import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialPreferences = {
  roomType: null,
  sleepTime: null,
  wakeUpTime: null,
  noisePreference: null,
  cleanlinessLevel: 3,
  studyFrequency: null,
  studyEnvironment: null,
  socialPreference: null,
  personalSpace: null,
  visitorPreference: null,
};

// ─── Step Configurations ──────────────────────────────────────────────────────

const steps = [
  {
    id: 1,
    title: 'Room Type',
    subtitle: 'Choose your preferred room sharing type',
  },
  {
    id: 2,
    title: 'Sleep & Routine',
    subtitle: 'Tell us about your daily schedule',
  },
  {
    id: 3,
    title: 'Lifestyle Preferences',
    subtitle: 'Help us understand your living preferences',
  },
  {
    id: 4,
    title: 'Review & Submit',
    subtitle: 'Review your preferences before submitting',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
        <span className="text-xs font-medium text-green-700">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function RoomTypeCard({ type, selected, onSelect }) {
  const configs = {
    '2_SHARING': {
      number: '2',
      label: 'Sharing',
      description: 'Room for 2 students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    '3_SHARING': {
      number: '3',
      label: 'Sharing',
      description: 'Room for 3 students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
  };

  const config = configs[type];
  const isSelected = selected === type;

  return (
    <button
      onClick={() => onSelect(type)}
      className={`flex-1 p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer text-center
        ${isSelected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <div className={`inline-flex items-center justify-center mb-3 ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>
        {config.icon}
      </div>
      <div className="mb-1">
        <span className={`text-2xl font-bold ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
          {config.number}
        </span>
        <span className={`text-base font-semibold ml-1 ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
          {config.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{config.description}</p>
      <div className={`w-5 h-5 rounded-full border-2 mx-auto transition-colors
        ${isSelected ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}`}>
        {isSelected && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-full h-full">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
}

function RadioOption({ label, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-150 cursor-pointer w-full text-left
        ${selected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors
        ${selected ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}`}>
        {selected && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-full h-full">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className={`text-sm font-medium ${selected ? 'text-green-800' : 'text-gray-700'}`}>
        {label}
      </span>
    </button>
  );
}

function SliderInput({ label, value, onChange, min = 1, max = 5 }) {
  const labels = ['Not Important', '', '', '', 'Very Important'];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-green-700">{value} / {max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        style={{
          background: `linear-gradient(to right, #2d5016 0%, #2d5016 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
        }}
      />
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{labels[0]}</span>
        <span className="text-xs text-gray-400">{labels[4]}</span>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [submitting, setSubmitting] = useState(false);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (currentStep === 1) return preferences.roomType !== null;
    if (currentStep === 2) return preferences.sleepTime !== null && preferences.wakeUpTime !== null;
    if (currentStep === 3) {
      return preferences.noisePreference !== null &&
             preferences.studyFrequency !== null &&
             preferences.studyEnvironment !== null &&
             preferences.socialPreference !== null &&
             preferences.personalSpace !== null &&
             preferences.visitorPreference !== null;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO: API call to save preferences
    setTimeout(() => {
      setSubmitting(false);
      navigate('/student/dashboard');
    }, 1500);
  };

  const formatValue = (key) => {
    const v = preferences[key];
    if (v === null) return '—';
    
    const formats = {
      roomType: { '2_SHARING': '2-Sharing', '3_SHARING': '3-Sharing' },
      sleepTime: { 'BEFORE_10': 'Before 10 PM', '10_TO_12': '10 PM – 12 AM', 'AFTER_12': 'After 12 AM' },
      wakeUpTime: { 'BEFORE_6': 'Before 6 AM', '6_TO_8': '6 AM – 8 AM', '8_TO_10': '8 AM – 10 AM', 'AFTER_10': 'After 10 AM' },
      noisePreference: { 'VERY_QUIET': 'Very quiet', 'MODERATELY_QUIET': 'Moderately quiet', 'NO_PREFERENCE': 'No preference', 'COMFORTABLE_WITH_NOISE': 'Comfortable with noise' },
      studyFrequency: { 'FREQUENTLY': 'Frequently', 'SOMETIMES': 'Sometimes', 'RARELY': 'Rarely' },
      studyEnvironment: { 'COMPLETE_SILENCE': 'Complete silence', 'LOW_NOISE_OK': 'Low noise okay', 'NOISE_NO_ISSUE': 'Noise doesn\'t bother' },
      socialPreference: { 'PREFER_PRIVACY': 'Prefer privacy', 'BALANCED': 'Balanced', 'VERY_SOCIAL': 'Very social' },
      personalSpace: { 'NOT_VERY_IMPORTANT': 'Not very important', 'MODERATELY_IMPORTANT': 'Moderately important', 'VERY_IMPORTANT': 'Very important' },
      visitorPreference: { 'PREFER_NO_VISITORS': 'Prefer no visitors', 'OCCASIONAL_OK': 'Occasional visitors okay', 'VISITORS_FINE': 'Visitors are fine' },
    };
    
    if (key === 'cleanlinessLevel') return `${v} / 5`;
    return formats[key]?.[v] || v;
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">

        {/* Progress */}
        <ProgressBar currentStep={currentStep} totalSteps={4} />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h1>
          <p className="text-sm text-gray-500 mt-1">{steps[currentStep - 1].subtitle}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">

          {/* Step 1: Room Type */}
          {currentStep === 1 && (
            <div className="flex gap-4">
              <RoomTypeCard
                type="2_SHARING"
                selected={preferences.roomType}
                onSelect={(type) => updatePreference('roomType', type)}
              />
              <RoomTypeCard
                type="3_SHARING"
                selected={preferences.roomType}
                onSelect={(type) => updatePreference('roomType', type)}
              />
            </div>
          )}

          {/* Step 2: Sleep & Routine */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What time do you usually sleep?</label>
                <div className="space-y-2">
                  <RadioOption label="Before 10 PM" selected={preferences.sleepTime === 'BEFORE_10'} onSelect={() => updatePreference('sleepTime', 'BEFORE_10')} />
                  <RadioOption label="10 PM – 12 AM" selected={preferences.sleepTime === '10_TO_12'} onSelect={() => updatePreference('sleepTime', '10_TO_12')} />
                  <RadioOption label="After 12 AM" selected={preferences.sleepTime === 'AFTER_12'} onSelect={() => updatePreference('sleepTime', 'AFTER_12')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What time do you usually wake up?</label>
                <div className="space-y-2">
                  <RadioOption label="Before 6 AM" selected={preferences.wakeUpTime === 'BEFORE_6'} onSelect={() => updatePreference('wakeUpTime', 'BEFORE_6')} />
                  <RadioOption label="6 AM – 8 AM" selected={preferences.wakeUpTime === '6_TO_8'} onSelect={() => updatePreference('wakeUpTime', '6_TO_8')} />
                  <RadioOption label="8 AM – 10 AM" selected={preferences.wakeUpTime === '8_TO_10'} onSelect={() => updatePreference('wakeUpTime', '8_TO_10')} />
                  <RadioOption label="After 10 AM" selected={preferences.wakeUpTime === 'AFTER_10'} onSelect={() => updatePreference('wakeUpTime', 'AFTER_10')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What kind of room environment do you prefer?</label>
                <div className="space-y-2">
                  <RadioOption label="Very quiet" selected={preferences.noisePreference === 'VERY_QUIET'} onSelect={() => updatePreference('noisePreference', 'VERY_QUIET')} />
                  <RadioOption label="Moderately quiet" selected={preferences.noisePreference === 'MODERATELY_QUIET'} onSelect={() => updatePreference('noisePreference', 'MODERATELY_QUIET')} />
                  <RadioOption label="No preference" selected={preferences.noisePreference === 'NO_PREFERENCE'} onSelect={() => updatePreference('noisePreference', 'NO_PREFERENCE')} />
                  <RadioOption label="Comfortable with noise" selected={preferences.noisePreference === 'COMFORTABLE_WITH_NOISE'} onSelect={() => updatePreference('noisePreference', 'COMFORTABLE_WITH_NOISE')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <SliderInput
                  label="How important is cleanliness to you?"
                  value={preferences.cleanlinessLevel}
                  onChange={(val) => updatePreference('cleanlinessLevel', val)}
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How often do you study in your room?</label>
                <div className="space-y-2">
                  <RadioOption label="Frequently" selected={preferences.studyFrequency === 'FREQUENTLY'} onSelect={() => updatePreference('studyFrequency', 'FREQUENTLY')} />
                  <RadioOption label="Sometimes" selected={preferences.studyFrequency === 'SOMETIMES'} onSelect={() => updatePreference('studyFrequency', 'SOMETIMES')} />
                  <RadioOption label="Rarely" selected={preferences.studyFrequency === 'RARELY'} onSelect={() => updatePreference('studyFrequency', 'RARELY')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What environment do you prefer while studying?</label>
                <div className="space-y-2">
                  <RadioOption label="Complete silence" selected={preferences.studyEnvironment === 'COMPLETE_SILENCE'} onSelect={() => updatePreference('studyEnvironment', 'COMPLETE_SILENCE')} />
                  <RadioOption label="Low noise is okay" selected={preferences.studyEnvironment === 'LOW_NOISE_OK'} onSelect={() => updatePreference('studyEnvironment', 'LOW_NOISE_OK')} />
                  <RadioOption label="Noise doesn't bother me" selected={preferences.studyEnvironment === 'NOISE_NO_ISSUE'} onSelect={() => updatePreference('studyEnvironment', 'NOISE_NO_ISSUE')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What kind of roommate environment do you prefer?</label>
                <div className="space-y-2">
                  <RadioOption label="Prefer privacy" selected={preferences.socialPreference === 'PREFER_PRIVACY'} onSelect={() => updatePreference('socialPreference', 'PREFER_PRIVACY')} />
                  <RadioOption label="Balanced" selected={preferences.socialPreference === 'BALANCED'} onSelect={() => updatePreference('socialPreference', 'BALANCED')} />
                  <RadioOption label="Very social" selected={preferences.socialPreference === 'VERY_SOCIAL'} onSelect={() => updatePreference('socialPreference', 'VERY_SOCIAL')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How important is personal space to you?</label>
                <div className="space-y-2">
                  <RadioOption label="Not very important" selected={preferences.personalSpace === 'NOT_VERY_IMPORTANT'} onSelect={() => updatePreference('personalSpace', 'NOT_VERY_IMPORTANT')} />
                  <RadioOption label="Moderately important" selected={preferences.personalSpace === 'MODERATELY_IMPORTANT'} onSelect={() => updatePreference('personalSpace', 'MODERATELY_IMPORTANT')} />
                  <RadioOption label="Very important" selected={preferences.personalSpace === 'VERY_IMPORTANT'} onSelect={() => updatePreference('personalSpace', 'VERY_IMPORTANT')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How comfortable are you with roommates having visitors?</label>
                <div className="space-y-2">
                  <RadioOption label="Prefer no visitors" selected={preferences.visitorPreference === 'PREFER_NO_VISITORS'} onSelect={() => updatePreference('visitorPreference', 'PREFER_NO_VISITORS')} />
                  <RadioOption label="Occasional visitors are okay" selected={preferences.visitorPreference === 'OCCASIONAL_OK'} onSelect={() => updatePreference('visitorPreference', 'OCCASIONAL_OK')} />
                  <RadioOption label="Visitors are fine" selected={preferences.visitorPreference === 'VISITORS_FINE'} onSelect={() => updatePreference('visitorPreference', 'VISITORS_FINE')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div>
              <div className="bg-gray-50 rounded-lg p-5 mb-4">
                <ReviewItem label="Room Type" value={formatValue('roomType')} />
                <ReviewItem label="Sleep Time" value={formatValue('sleepTime')} />
                <ReviewItem label="Wake Up Time" value={formatValue('wakeUpTime')} />
                <ReviewItem label="Noise Preference" value={formatValue('noisePreference')} />
                <ReviewItem label="Cleanliness Level" value={formatValue('cleanlinessLevel')} />
                <ReviewItem label="Study Frequency" value={formatValue('studyFrequency')} />
                <ReviewItem label="Study Environment" value={formatValue('studyEnvironment')} />
                <ReviewItem label="Social Preference" value={formatValue('socialPreference')} />
                <ReviewItem label="Personal Space" value={formatValue('personalSpace')} />
                <ReviewItem label="Visitor Preference" value={formatValue('visitorPreference')} />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Please review your preferences carefully. You can edit them anytime from your dashboard.
              </p>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700
                hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ← Back
            </button>
          )}

          <div className="flex-1" />

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: canProceed() ? 'linear-gradient(135deg, #2d5016, #4a7c2c)' : '#9ca3af' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer
                disabled:opacity-60 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Preferences'
              )}
            </button>
          )}
        </div>

      </div>
    </StudentLayout>
  );
}
