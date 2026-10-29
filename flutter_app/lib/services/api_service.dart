// TaskPulse REST API Client with Dio & Retrofit
// Package: com.samdrashti.file1
// Implements Dio client with interceptors, timeouts, and Retrofit REST annotations

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/task_model.dart';

part 'api_service.g.dart';

@RestApi(baseUrl: "http://localhost:3000/api")
abstract class RestApiClient {
  factory RestApiClient(Dio dio, {String baseUrl}) = _RestApiClient;

  // --- TASKS ENDPOINTS ---
  @GET("/tasks")
  Future<List<Task>> getTasks();

  @POST("/tasks")
  Future<Task> createTask(@Body() Map<String, dynamic> taskData);

  @PUT("/tasks/{id}")
  Future<Map<String, dynamic>> updateTask(
    @Path("id") String id,
    @Body() Map<String, dynamic> updates,
  );

  @DELETE("/tasks/{id}")
  Future<void> deleteTask(@Path("id") String id);

  // --- ON-CALL & ROUTINES ---
  @GET("/routines")
  Future<List<dynamic>> getRoutines();

  @POST("/routines/activate")
  Future<Map<String, dynamic>> activateRoutine(@Body() Map<String, dynamic> body);

  // --- FOCUS MODE & GAMIFICATION ---
  @POST("/focus/complete")
  Future<Map<String, dynamic>> completeFocusSession(@Body() Map<String, dynamic> body);

  @GET("/gamification")
  Future<Map<String, dynamic>> getGamificationStats();

  // --- AUTHENTICATION (Strictly Passwordless & Social Logins Only) ---
  @POST("/auth/passwordless")
  Future<Map<String, dynamic>> passwordlessLogin(@Body() Map<String, dynamic> body);

  @POST("/auth/social")
  Future<Map<String, dynamic>> socialLogin(@Body() Map<String, dynamic> body);

  // --- SCRATCHPAD & QUICK NOTES ---
  @GET("/scratchpad")
  Future<List<dynamic>> getScratchNotes();

  @POST("/scratchpad")
  Future<Map<String, dynamic>> createScratchNote(@Body() Map<String, dynamic> note);

  @DELETE("/scratchpad/{id}")
  Future<void> deleteScratchNote(@Path("id") String id);
}

// Dio Factory Helper with Base Options & Interceptors
class DioClientFactory {
  static Dio createDioClient({String? authToken}) {
    final dio = Dio(
      BaseOptions(
        baseUrl: "http://localhost:3000/api",
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          if (authToken != null) "Authorization": "Bearer $authToken",
        },
      ),
    );

    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => print("[TaskPulse Dio]: $obj"),
      ),
    );

    return dio;
  }
}
