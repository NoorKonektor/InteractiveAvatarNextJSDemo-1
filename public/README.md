# Media Files

This directory contains placeholder media files for the Virtual Meeting Assistant.

## Required Files

To make the preset buttons fully functional, add the following files:

### Videos (public/videos/)
- `booking-tutorial.mp4` - Tutorial video for booking appointments
- `services-overview.mp4` - Overview of available services

### Images (public/images/)
- `office-hours.jpg` - Office hours and contact information
- `insurance-info.jpg` - Insurance coverage information

### Maps
The app uses Google Maps embeds for location information. Update the `mediaUrl` in `components/PresetButtons.tsx` with your actual location coordinates and Google Maps embed URLs.

## Implementation Notes

The media display component supports:
- Video files (MP4 format recommended)
- Image files (JPG, PNG)
- Google Maps embeds (iframe)

All media files will be displayed in a modal overlay when users click the preset buttons.
